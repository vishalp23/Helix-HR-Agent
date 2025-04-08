import { io, Socket } from "socket.io-client";

// Define WebSocket URL
const SOCKET_URL = "http://localhost:5000"; // Ensure this matches your backend

// Initialize WebSocket connection
const socket: Socket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    reconnectionAttempts: 10,
    reconnectionDelay: 2000, // 2-second delay before retrying
});

// Log WebSocket events for debugging
socket.on("connect", () => {
    console.log("Connected to WebSocket Server:", socket.id);
});

socket.on("disconnect", () => {
    console.log(" Disconnected from WebSocket Server");
});

export default socket;
