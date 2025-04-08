import React, { useState } from "react";
import { 
  Box, Typography, Accordion, AccordionSummary, AccordionDetails, IconButton, 
  Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button 
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ReactQuill from "react-quill";
import "quill/dist/quill.snow.css";
 // ✅ Import Quill styles

export interface Sequence {
  id: number;
  title: string;
  message: {
    subject: string;
    body: string;
  };
}

interface SequencesProps {
  sequences: Sequence[];
  onDeleteSequence: (id: number) => void;
  onExecuteSequence: (id: number) => void;
  onUpdateSequence: (id: number, newMessage: { subject: string; body: string }) => void;
}

const Sequences: React.FC<SequencesProps> = ({ sequences, onDeleteSequence, onExecuteSequence, onUpdateSequence }) => {
  const [editOpen, setEditOpen] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(null);
  const [updatedMessage, setUpdatedMessage] = useState({ subject: "", body: "" });

  const handleEditClick = (sequence: Sequence) => {
    setSelectedSequence(sequence);
    setUpdatedMessage(sequence.message);
    setEditOpen(true);
  };

  const handleSave = () => {
    if (selectedSequence) {
      onUpdateSequence(selectedSequence.id, updatedMessage);
      setEditOpen(false);
    }
  };

  return (
    <Box>
      {sequences.map((sequence) => (
        <Accordion key={sequence.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ flexGrow: 1, fontWeight: "bold" }}>{sequence.title}</Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Typography variant="subtitle2">
              <strong>Subject:</strong> {sequence.message.subject || "No Subject"}
            </Typography>
            <Typography variant="body2">
              <strong>Body:</strong>
              <div dangerouslySetInnerHTML={{ __html: sequence.message.body || "No Content Provided" }} />
            </Typography>

            <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
              <IconButton onClick={() => handleEditClick(sequence)} color="primary">
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => onDeleteSequence(sequence.id)} color="error">
                <DeleteIcon />
              </IconButton>
              <IconButton onClick={() => onExecuteSequence(sequence.id)} color="success">
                <PlayArrowIcon />
              </IconButton>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* ✅ Edit Modal with Quill Editor */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Sequence</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Subject"
            value={updatedMessage.subject}
            onChange={(e) => setUpdatedMessage({ ...updatedMessage, subject: e.target.value })}
            margin="dense"
          />
          
          <Typography variant="subtitle1" sx={{ mt: 2 }}>Body</Typography>
          <div><ReactQuill 
            theme="snow" 
            value={updatedMessage.body} 
            onChange={(value) => setUpdatedMessage({ ...updatedMessage, body: value })}
          /></div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={handleSave} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sequences;
