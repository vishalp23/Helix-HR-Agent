import React, { useState } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'; // Removed DialogClose as per provided code
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, Play } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import { Sequence } from '../types';

interface SequencesProps {
  sequences: Sequence[];
  onDeleteSequence: (id: number) => void;
  onExecuteSequence: (id: number) => void;
  onUpdateSequence: (id: number, newMessage: { subject: string; body: string }) => void;
}

const Sequences: React.FC<SequencesProps> = ({
  sequences,
  onDeleteSequence,
  onExecuteSequence,
  onUpdateSequence,
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(null);
  const [updatedMessage, setUpdatedMessage] = useState({ subject: '', body: '' });

  const handleEditClick = (sequence: Sequence) => {
    setSelectedSequence(sequence);
    setUpdatedMessage(sequence.message);
    setEditOpen(true);
  };

  const handleSave = () => {
    if (selectedSequence) {
      onUpdateSequence(selectedSequence.id, updatedMessage);
      setEditOpen(false);
      setSelectedSequence(null); // Clear selected sequence after save
    }
  };

  const handleDialogClose = () => {
    setEditOpen(false);
    setSelectedSequence(null);
  }

  return (
    <div className="space-y-4">
      {sequences && sequences.length > 0 ? (
        <Accordion type="multiple" className="w-full">
          {sequences.map((sequence) => (
            <AccordionItem key={sequence.id} value={`item-${sequence.id}`}>
              <AccordionTrigger className="hover:no-underline">
                <span className="font-semibold text-left flex-1">{sequence.title}</span>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`subject-${sequence.id}`} className="text-xs font-semibold text-muted-foreground">Subject</Label>
                    <p id={`subject-${sequence.id}`} className="text-sm">{sequence.message.subject || 'No Subject'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground">Body</Label>
                    <div
                      className="text-sm prose prose-sm dark:prose-invert max-w-none mt-1" // Added mt-1 for spacing
                      dangerouslySetInnerHTML={{ __html: sequence.message.body || '<p>No Content Provided</p>' }}
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(sequence)}>
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDeleteSequence(sequence.id)} className="text-destructive hover:text-destructive focus:ring-destructive">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                    <Button variant="default" size="sm" onClick={() => onExecuteSequence(sequence.id)}>
                      <Play className="h-4 w-4 mr-2" /> Execute
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p className="text-muted-foreground text-center py-4">No sequences available.</p>
      )}

      {selectedSequence && (
        // Using onOpenChange for Dialog to handle closing via ESC or overlay click
        <Dialog open={editOpen} onOpenChange={(isOpen) => { if (!isOpen) handleDialogClose(); else setEditOpen(true); }}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Sequence: {selectedSequence.title}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-subject" className="text-right">
                  Subject
                </Label>
                <Input
                  id="edit-subject"
                  value={updatedMessage.subject}
                  onChange={(e) => setUpdatedMessage({ ...updatedMessage, subject: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="edit-body" className="col-span-4 text-left mb-1">
                  Body
                </Label>
                <div className="col-span-4 h-[200px] overflow-y-auto bg-background rounded-md border">
                    <ReactQuill
                        theme="snow"
                        value={updatedMessage.body}
                        onChange={(value) => setUpdatedMessage({ ...updatedMessage, body: value })}
                        className="h-full border-0 [&>.ql-container]:border-none [&>.ql-toolbar]:rounded-t-md [&>.ql-toolbar]:border-b [&>.ql-toolbar]:border-input" // Added specific Quill styling
                        modules={{ toolbar: [
                            [{ 'header': [1, 2, false] }],
                            ['bold', 'italic', 'underline'],
                            [{'list': 'ordered'}, {'list': 'bullet'}],
                            ['link']
                        ]}}
                    />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleDialogClose}>Cancel</Button>
              <Button type="button" onClick={handleSave}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Sequences;
