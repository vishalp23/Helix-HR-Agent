import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import ChatBar from "./components/chatBar";
import Workspace from "./components/Workspace";
import Header from "./components/Header";
import { ThemeProvider } from "./components/theme-provider";
import { ChatMessage, Task } from "./types"; // Import from types.ts

interface WorkspacePayload {
  tasks: Task[];
}

// Adjust to your backend server
const socket: Socket = io("http://localhost:5000", {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

const App: React.FC = () => {
  // Socket + Chat + Workspace Logic
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [workspaceTasks, setWorkspaceTasks] = useState<Task[]>([]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
    });

    socket.on("ai_response", (data: string) => {
      setChatMessages((prev) => [...prev, { sender: "Helix", text: data }]);
    });

    socket.on("workspace_update", (data: WorkspacePayload) => {
      setWorkspaceTasks(data.tasks || []);
      // setChatMessages((prev) => [
      //   ...prev,
      //   {
      //     sender: "Helix",
      //     text: "Final outreach sequence generated. Check the workspace for details.",
      //   },
      // ]);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      socket.off("connect");
      socket.off("ai_response");
      socket.off("workspace_update");
      socket.off("disconnect");
    };
  }, []);

  const sendMessage = (message: string) => {
    setChatMessages((prev) => [...prev, { sender: "User", text: message }]);
    socket.emit("user_message", message);
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="helix-ui-theme">
      <div className="bg-background text-foreground min-h-screen flex flex-col p-4 md:p-6">
        <Header /> {/* Props removed for now */}
        <div className="flex flex-1 overflow-hidden mt-4 md:mt-6 gap-4 md:gap-6">
          <div className="w-full md:w-[45%] flex flex-col overflow-hidden rounded-lg">
            <ChatBar messages={chatMessages} onSend={sendMessage} />
          </div>
          <div className="flex-1 flex flex-col overflow-hidden rounded-lg">
            <Workspace tasks={workspaceTasks} />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;
