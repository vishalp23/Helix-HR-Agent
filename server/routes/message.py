from flask import Blueprint, request, jsonify
from agent.helix_agent import helix_agent

message_bp = Blueprint("message", __name__)

@message_bp.route("/message", methods=["POST"])
def handle_http_message():
    data = request.json
    response = helix_agent.process_query(data.get("message", ""))
    return jsonify(response)
