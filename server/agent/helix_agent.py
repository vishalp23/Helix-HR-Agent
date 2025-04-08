import os
import json
from openai import OpenAI
from database.db_setup import insert_message, insert_task

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

class HelixAgent:
    def __init__(self, model="gpt-4", socketio_instance=None):
        self.model = model
        self.conversation_history = []
        self.latest_workspace = None
        self.required_fields = {
            "job_role": None,
            "technologies": None,
            "company_description": None,
            "location": None,
            "benefits": None
        }
        self.socketio = socketio_instance

    def process_query(self, user_input: str) -> dict:
        """Processes user input, prevents repeated questions, and generates outreach sequences."""
        self.conversation_history.append({"role": "user", "content": user_input})
        insert_message("User", user_input)

        is_edit_request = any(keyword in user_input.lower() for keyword in ["edit", "change", "modify", "update"])
        is_addition_request = any(keyword in user_input.lower() for keyword in ["add", "insert", "append"])

        if is_addition_request and self.latest_workspace:
            workspace_output = self._append_new_step(user_input)
        elif is_edit_request and self.latest_workspace:
            workspace_output = self._modify_existing_sequence(user_input)
        else:
            self._update_fields_with_history()
            missing_fields = [key for key, value in self.required_fields.items() if value is None]

            if missing_fields:
                next_missing_field = missing_fields[0]
                return {
                    "type": "question",
                    "chat": {"type": "question", "content": f"What is the {next_missing_field.replace('_', ' ')}?"},
                    "workspace": {}
                }

            if self.socketio:
                self.socketio.emit("ai_response", "Generating outreach sequence...")

            workspace_output = self._generate_workspace_update()

        response = {
            "type": "final",
            "chat": None,
            "workspace": workspace_output if workspace_output else {}
        }

        self.conversation_history.append({"role": "assistant", "content": json.dumps(response)})
        return response

    def _update_fields_with_history(self):
        """Ensures answered fields are not asked again by using conversation history."""
        instruction = (
            "Analyze the conversation history and extract structured hiring details.\n"
            "Fill missing fields but do NOT overwrite already stored values.\n\n"
            f"Current Data: {json.dumps(self.required_fields)}\n"
            f"Conversation History: {json.dumps(self.conversation_history[-5:])}\n\n"
            "Return updated JSON in this format:\n"
            "{\n"
            '  "job_role": "Extracted job role",\n'
            '  "technologies": "Extracted relevant skills",\n'
            '  "company_description": "Company details",\n'
            '  "location": "Mentioned location",\n'
            '  "benefits": "Any perks, salary, or compensation details"\n'
            "}"
        )

        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[{"role": "system", "content": instruction}, *self.conversation_history],
                max_tokens=500,
                temperature=0.3,
            )

            extracted_data = json.loads(response.choices[0].message.content.strip())
            if isinstance(extracted_data, dict):
                for key in self.required_fields.keys():
                    if extracted_data.get(key) and self.required_fields[key] is None:
                        self.required_fields[key] = extracted_data[key]

        except (json.JSONDecodeError, ValueError) as e:
            print(f"ERROR: Failed to extract details - {e}")

    def _generate_workspace_update(self) -> dict:
        """Generates hiring outreach sequence after all fields are provided."""
        instruction = (
            "You are Helix, an AI recruiter responsible for hiring software engineers.\n\n"
            "Generate a structured JSON outreach sequence to attract and hire top talent.\n\n"
            "Each step must include:\n"
            "  - `id`: Step number\n"
            "  - `description`: Short description of the step\n"
            "  - `message`: An object with `subject` and `body` fields\n\n"
            "Your response MUST be in valid JSON format like this:\n"
            "{\n"
            '  "tasks": [\n'
            '    {"id": 1, "description": "Step 1: Initial outreach email",\n'
            '     "message": {"subject": "Email Subject", "body": "Email Body"}},\n'
            '    {"id": 2, "description": "Step 2: Follow-up email",\n'
            '     "message": {"subject": "Follow-up Subject", "body": "Follow-up Body"}},\n'
            '    {"id": 3, "description": "Step 3: Final email",\n'
            '     "message": {"subject": "Final Email Subject", "body": "Final Email Body"}}\n'
            '  ],\n'
            '  "final_sequence": "A structured 3-step outreach sequence to hire the best candidates."\n'
            "}\n\n"
            f"Job Role: {self.required_fields['job_role']}\n"
            f"Technologies: {self.required_fields['technologies']}\n"
            f"Company: {self.required_fields['company_description']}\n"
            f"Location: {self.required_fields['location']}\n"
            f"Benefits: {self.required_fields['benefits']}\n"
        )


        return self._get_ai_response(instruction)

    def _modify_existing_sequence(self, user_input: str) -> dict:
        """Modifies an existing step without erasing previous steps."""

        if not self.latest_workspace or "tasks" not in self.latest_workspace:
            return {"tasks": [], "final_sequence": "Error: No existing sequence to modify."}

        instruction = (
            "You are Helix, an AI recruiter responsible for modifying the outreach sequence.\n\n"
            "**Modify ONLY the relevant step** based on the user's request. **DO NOT create a new sequence** from scratch.\n"
            "**DO NOT erase** steps that are not mentioned.\n\n"
            f"EXISTING SEQUENCE:\n{json.dumps(self.latest_workspace, indent=2)}\n\n"
            f"USER REQUEST:\n{user_input}\n\n"
            "Your response MUST follow this exact JSON format:\n"
            "{\n"
            '  "tasks": [\n'
            '    {"id": 1, "description": "Step 1: Updated Initial outreach email to potential candidates",\n'
            '     "message": {"subject": "Updated Email Subject",\n'
            '                 "body": "Updated Email Content"}},\n'
            '    {"id": 2, "description": "Existing Step 2",\n'
            '     "message": {"subject": "Existing Subject", "body": "Existing Body"}},\n'
            '    {"id": 3, "description": "Existing Step 3",\n'
            '     "message": {"subject": "Existing Subject", "body": "Existing Body"}}\n'
            '  ],\n'
            '  "final_sequence": "Updated outreach sequence including modified step."\n'
            "}"
        )

        modified_response = self._get_ai_response(instruction)

        # ✅ Validate AI response before applying changes
        if isinstance(modified_response, dict) and "tasks" in modified_response:
            for step in modified_response["tasks"]:
                if step["id"] == 1:  # ✅ Ensure Step 1 is fully updated
                    self.latest_workspace["tasks"][0] = step  # ✅ Replace step 1 with full update
                
            self.latest_workspace["final_sequence"] = modified_response["final_sequence"]

            # ✅ Emit updated sequence to frontend UI
            if self.socketio:
                self.socketio.emit("update_workspace", self.latest_workspace)

            return self.latest_workspace

        else:
            print(f"❌ AI Returned Invalid Step Modification: {modified_response}")  
            return {"tasks": self.latest_workspace["tasks"], "final_sequence": "Error: AI response did not contain a valid step modification."}

    def _append_new_step(self, user_input: str) -> dict:
        """Appends a new step to the outreach sequence without modifying existing steps."""

        if not self.latest_workspace or "tasks" not in self.latest_workspace:
            return {"tasks": [], "final_sequence": "Error: No existing sequence to append a step to."}

        instruction = (
            "You are Helix, an AI recruiting assistant responsible for hiring employees.\n\n"
            "Add **ONLY ONE new step** to the existing outreach sequence based on the user's request.\n"
            "**DO NOT modify** or erase existing steps.\n\n"
            f"EXISTING SEQUENCE:\n{json.dumps(self.latest_workspace)}\n\n"
            f"USER REQUEST:\n{user_input}\n\n"
            "Your response MUST include the full sequence with the added step:\n"
            "{\n"
            '  "tasks": [\n'
            '    {"id": 1, "description": "Existing Step 1"},\n'
            '    {"id": 2, "description": "Existing Step 2"},\n'
            '    {"id": 3, "description": "Existing Step 3"},\n'
            '    {"id": 4, "description": "New Step Added"}\n'
            '  ],\n'
            '  "final_sequence": "Updated outreach sequence including new step."\n'
            "}"
        )

        new_step_response = self._get_ai_response(instruction)

        # ✅ Validate AI response
        if isinstance(new_step_response, dict) and "tasks" in new_step_response:
            self.latest_workspace["tasks"] = new_step_response["tasks"]  # ✅ Append new step
            self.latest_workspace["final_sequence"] = new_step_response["final_sequence"]  # ✅ Update summary

            # ✅ Emit updated sequence to frontend UI
            if self.socketio:
                self.socketio.emit("update_workspace", self.latest_workspace)

            return self.latest_workspace

        else:
            print(f"❌ AI Returned Invalid Step Addition: {new_step_response}")  # Debugging
            return {"tasks": self.latest_workspace["tasks"], "final_sequence": "Error: AI response did not contain a valid step addition."}

    def _get_ai_response(self, instruction: str) -> dict:
        """Helper function to get AI-generated responses and handle errors."""
        workspace_text = ""
        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[{"role": "system", "content": instruction}, *self.conversation_history],
                max_tokens=5000,
                temperature=0.7,
            )
            workspace_text = response.choices[0].message.content.strip()
            parsed_response = json.loads(workspace_text)

            # ✅ Ensure correct format: Convert 'sequence' to 'tasks'
            if "sequence" in parsed_response:
                parsed_response["tasks"] = [
                    {
                        "id": step["id"],
                        "description": f"Step {step['id']}: {step['type'].replace('_', ' ').title()}",
                        "message": {
                            "subject": step["subject"],
                            "body": step["body"]
                        }
                    }
                    for step in parsed_response["sequence"]
                ]
                del parsed_response["sequence"]  # ✅ Remove incorrect key

            # ✅ Validate AI response before applying changes
            if "tasks" not in parsed_response or not isinstance(parsed_response["tasks"], list):
                raise ValueError("Invalid response format from AI")

            self.latest_workspace = parsed_response  
            return parsed_response

        except (json.JSONDecodeError, ValueError, Exception) as e:
            print(f"ERROR: JSON decoding failed: {str(e)}\nResponse: {workspace_text}")
            return {"tasks": [], "final_sequence": "Error: AI returned malformed JSON. Please retry."}


# ✅ Global instance of HelixAgent
helix_agent = HelixAgent()
