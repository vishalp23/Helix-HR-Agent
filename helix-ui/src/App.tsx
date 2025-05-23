import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import ChatBar from "./components/chatBar";
import Workspace from "./components/Workspace";
import Header from "./components/Header";
import { Box, createTheme, ThemeProvider } from "@mui/material";

interface ChatMessage {
  sender: string;
  text: string;
}

export interface Task {
  id: number;
  description: string;
}

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

// 1. Define Light Glass Theme
const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2196F3",
    },
    secondary: {
      main: "#607D8B",
    },
    error: {
      main: "#F44336",
    },
    success: {
      main: "#4CAF50",
    },
    background: {
      default: "#F5F7FA", // outer background
      paper: "#FFFFFF",    // MUI “paper” background
    },
    text: {
      primary: "rgba(0, 0, 0, 0.87)",
      secondary: "rgba(0, 0, 0, 0.6)",
    },
  },
  shape: {
    borderRadius: 8, // global corner radius
  },
});

// 2. Define Dark Glass Theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#64B5F6",
    },
    secondary: {
      main: "#90A4AE",
    },
    error: {
      main: "#E57373",
    },
    success: {
      main: "#81C784",
    },
    background: {
      default: "#121212", // outer background
      paper: "#1E1E1E",    // MUI “paper” background
    },
    text: {
      primary: "#FFFFFF",
      secondary: "rgba(255, 255, 255, 0.7)",
    },
  },
  shape: {
    borderRadius: 8,
  },
});

const App: React.FC = () => {
  // 3. Manage theme toggle state
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // 4. Socket + Chat + Workspace Logic
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
    // 5. Wrap everything in ThemeProvider
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <Box
        sx={{
          // Outer background
          bgcolor: "background.default",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          p: { xs: 1, md: 2 },
          boxSizing: "border-box",
        }}
      >
        {/* Header with theme toggle */}
        <Header onToggleTheme={handleToggleTheme} isDarkMode={isDarkMode} />

        {/* Main content: Chat + Workspace */}
        <Box
          sx={{
            display: "flex",
            flex: 1,
            borderRadius: 0.5,
            overflow: "hidden",
            mt: { xs: 1, md: 2 },
            gap: { xs: 1, md: 2 },
          }}
        >
          {/* Left: Chat panel */}
          <Box
            sx={{
              width: { xs: "100%", md: "45%" },
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              borderRadius: 1,
            }}
          >
            <ChatBar messages={chatMessages} onSend={sendMessage} />
          </Box>

          {/* Right: Workspace panel */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column",overflow: "hidden", borderRadius: 0.5 }}>  
            <Workspace tasks={workspaceTasks}  />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
