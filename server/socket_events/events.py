from flask_socketio import SocketIO
from agent.helix_agent import HelixAgent

def register_socket_events(socketio: SocketIO, helix_agent: HelixAgent):
    """Registers all WebSocket event handlers and links HelixAgent."""

    @socketio.on("user_message")
    def handle_socket_message(message):
        """Handles incoming WebSocket messages and processes them with HelixAgent."""
        print(f"📩 Received socket message: {message}")

        try:
            result = helix_agent.process_query(message)
            print(f"✅ Processed LLM Result: {result}")

            if "chat" in result and result["chat"]:
                socketio.emit("ai_response", result["chat"]["content"])
            
            if "workspace" in result and result["workspace"]:
                socketio.emit("workspace_update", result["workspace"])

        except Exception as e:
            print(f"❌ Error processing socket message: {str(e)}")
            socketio.emit("ai_response", "An error occurred while processing your request. Please try again.")
