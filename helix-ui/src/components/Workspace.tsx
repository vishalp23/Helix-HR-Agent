import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Sequences from './Sequences'; // Keep this import
import { io } from 'socket.io-client';
import { Task, Sequence } from '../types'; // Import from centralized types

const socket = io('http://localhost:5000');

interface WorkspaceProps {
  tasks: Task[];
}

const Workspace: React.FC<WorkspaceProps> = ({ tasks }) => {
  const [currentTab, setCurrentTab] = useState<string>("sequences");
  const [sequences, setSequences] = useState<Sequence[]>([]);

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const convertedSequences: Sequence[] = tasks.map((task) => ({
        id: task.id,
        title: task.description,
        message: {
          subject: task.message?.subject || task.email_subject || 'Generated Outreach Email',
          body: task.message?.body || task.email_body || 'No Content Provided',
        },
      }));
      setSequences(convertedSequences);
    } else {
      setSequences([]);
    }
  }, [tasks]);

  useEffect(() => {
    const handleSocketUpdate = (updatedWorkspace: { tasks: Task[] }) => {
      console.log('🔄 Received workspace update:', updatedWorkspace);
      if (updatedWorkspace.tasks) {
        setSequences(
          updatedWorkspace.tasks.map((task) => ({
            id: task.id,
            title: task.description,
            message: {
              subject: task.email_subject || task.message?.subject || 'Generated Outreach Email',
              body: task.email_body || task.message?.body || 'No Content Provided',
            },
          }))
        );
      }
    };
    socket.on('workspace_update', handleSocketUpdate);
    return () => {
      socket.off('workspace_update', handleSocketUpdate);
    };
  }, []);

  const handleExecuteSequence = (id: number) => {
    console.log(`Executing sequence ${id}`);
    // Placeholder for actual execution logic
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
    <div className="flex flex-col h-full rounded-lg border bg-card text-card-foreground shadow-md p-4 md:p-6 overflow-hidden">
      <Tabs value={currentTab} onValueChange={setCurrentTab} defaultValue="sequences" className="flex flex-col flex-1 h-full overflow-hidden">
        <TabsList className="mb-4 w-full sm:w-auto self-start">
          <TabsTrigger value="sequences">Sequences</TabsTrigger>
          {/* Add more TabsTriggers here if new tabs are introduced */}
        </TabsList>
        <TabsContent value="sequences" className="flex-1 overflow-y-auto">
          <Sequences
            sequences={sequences}
            onDeleteSequence={handleDeleteSequence}
            onExecuteSequence={handleExecuteSequence}
            onUpdateSequence={handleUpdateSequence}
          />
        </TabsContent>
        {/* Add more TabsContent here */}
      </Tabs>
    </div>
  );
};

export default Workspace;
