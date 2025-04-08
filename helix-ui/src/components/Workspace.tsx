import React, { useState, useEffect } from "react";
import { Box, Paper, Tabs, Tab } from "@mui/material";
import Sequences, { Sequence } from "./Sequences";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // ✅ Connect to the backend

export interface Task {
  id: number;
  description: string;
  email_subject?: string;
  email_body?: string;
  content?: string; // ✅ This might hold the actual message
  message?: {
    subject: string;
    body: string;
  };
  sequence?: {   // ✅ Add this to match the backend response
    subject: string;
    body: string;
  };
}

interface WorkspaceProps {
  tasks: Task[];
}

const Workspace: React.FC<WorkspaceProps> = ({ tasks }) => {
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [sequences, setSequences] = useState<Sequence[]>([]);

  // ✅ Ensure AI-generated sequences update properly
  useEffect(() => {
    if (tasks.length > 0) {
      const convertedSequences: Sequence[] = tasks.map((task) => ({
        id: task.id,
        title: task.description, 
        message: {
          subject: task.message?.subject || "Generated Outreach Email", 
          body: task.message?.body || "No Content Provided", 
        },
      }));
  
      console.log("🚀 Updating sequences:", convertedSequences);
      setSequences(convertedSequences);
    }
  }, [tasks]);
  

  // ✅ Listen for AI-generated workspace updates from the backend
  useEffect(() => {
    const handleSocketUpdate = (updatedWorkspace: { tasks: Task[] }) => {
      console.log("🔄 Received workspace update:", updatedWorkspace);

      if (updatedWorkspace.tasks) {
        setSequences(
          updatedWorkspace.tasks.map((task) => ({
            id: task.id,
            title: task.description,
            message: {
              subject: task.email_subject || "Generated Outreach Email",
              body: task.message?.body || "No Content Provided",
            },
          }))
        );
      }
    };

    socket.on("update_workspace", handleSocketUpdate); // ✅ Listen for real-time AI updates

    return () => {
      socket.off("update_workspace", handleSocketUpdate); // ✅ Cleanup socket listener
    };
  }, []);

  const handleExecuteSequence = (id: number) => {
    console.log(`Executing sequence ${id}`);
  };

  const handleUpdateSequence = (id: number, newMessage: { subject: string; body: string }) => {
    setSequences((prevSequences) =>
      prevSequences.map((seq) =>
        seq.id === id ? { ...seq, message: newMessage } : seq
      )
    );
  };

  const handleDeleteSequence = (id: number) => {
    setSequences((prevSequences) => prevSequences.filter((seq) => seq.id !== id));
  };

  return (
    <Paper sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", p: 2 }}>
      <Tabs value={currentTab} onChange={(_e, newValue) => setCurrentTab(newValue)} variant="scrollable">
        <Tab label="Sequences" />
      </Tabs>

      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {currentTab === 0 && (
          <Sequences
            sequences={sequences}
            onDeleteSequence={handleDeleteSequence}
            onExecuteSequence={handleExecuteSequence}
            onUpdateSequence={handleUpdateSequence}
          />
        )}
      </Box>
    </Paper>
  );
};

export default Workspace;
