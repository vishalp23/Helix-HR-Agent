// helix-ui/src/types.ts
export interface ChatMessage {
  sender: string;
  text: string;
}

// Also, App.tsx defines Task and WorkspacePayload. Let's move Task here too for now,
// as it's a simple data structure that might be shared.
// WorkspacePayload can stay in App.tsx if it's only used there for socket events.
export interface Task {
  id: number;
  description: string;
  // Adding optional message structure to Task to align with Workspace.tsx's usage
  message?: {
    subject?: string;
    body?: string;
  };
  email_subject?: string; // Keep for compatibility with existing data
  email_body?: string;    // Keep for compatibility with existing data
}

export interface Sequence {
  id: number;
  title: string;
  message: {
    subject: string;
    body: string;
  };
}
