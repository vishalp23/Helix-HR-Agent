from flask import Blueprint, request, jsonify
from agent.helix_agent import helix_agent

execute_task_bp = Blueprint("execute_task", __name__)

@execute_task_bp.route("/execute-task", methods=["POST"])
def execute_task_endpoint():
    """
    Endpoint to execute a single task.
    Expects JSON with key "stepText" containing the task description.
    Returns the execution result as JSON.
    """
    try:
        data = request.json
        step_text = data.get("stepText", "")
        # Ensure that the HelixAgent class has an execute_step method
        result = helix_agent.execute_step(step_text)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"An error occurred: {str(e)}"
        }), 500
