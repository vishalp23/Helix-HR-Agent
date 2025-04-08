import React, { useState, useRef, useEffect } from "react";
import {
  Paper,
  Box,
  Typography,
  TextField,
  IconButton,
  List,
  Avatar,
  useTheme,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

interface ChatMessage {
  sender: string;
  text: string;
}

interface ChatBarProps {
  messages: ChatMessage[];
  onSend: (message: string) => void;
}

const ChatBar: React.FC<ChatBarProps> = ({ messages, onSend }) => {
  const theme = useTheme();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) {
      onSend(trimmed);
      setInput("");
    }
  };

  // Glassmorphism Background
  const glassBackground =
    theme.palette.mode === "dark"
      ? "linear-gradient(180deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2))"
      : "linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3))";

  const borderColor =
    theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.1)"
      : "rgba(255,255,255,0.3)";

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "85vh", // ✅ Fixed height for chat area
        maxHeight: "85vh",
        borderRadius: 1,
        background: glassBackground,
        backdropFilter: "blur(12px)",
        border: `1px solid ${borderColor}`,
        boxShadow: "0 4px 10px rgba(0,0,0,0.07)",
        color: "text.primary",
        overflow: "hidden", // ✅ Prevents app-level scrolling
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: "left", p: 2, borderBottom: `1px solid ${borderColor}` }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Chat with Helix
        </Typography>
      </Box>

      {/* Message Area - Scrollable */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto", // ✅ Enables internal scrolling
          p: 2,
          pr: 1,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
    display: "none",},
        }}
      >
        <List disablePadding>
          {messages.map((msg, index) => {
            const isUser =
              msg.sender.toLowerCase() === "user" || msg.sender.toLowerCase() === "you";
            return (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: isUser ? "row-reverse" : "row",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: "0.9rem",
                    bgcolor: isUser ? "primary.main" : "secondary.main",
                    ml: isUser ? 0 : 1,
                    mr: isUser ? 1 : 0,
                  }}
                >
                  {msg.sender.charAt(0).toUpperCase()}
                </Avatar>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 0.5,
                    maxWidth: "70%",
                    fontSize: "0.95rem",
                    boxShadow: 1,
                    backgroundColor: isUser ? "background.paper" : "background.paper",
                    color: "text.primary",
                    textAlign: isUser ? "right" : "left",
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      width: "10px",
                      height: "10px",
                      bgcolor: "background.paper",
                      top: "10px",
                      [isUser ? "right" : "left"]: "-5px",
                      transform: "rotate(45deg)",
                    },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: "bold", mb: 0.5 }}
                  >
                    {msg.sender}
                  </Typography>
                  <Typography variant="body2">{msg.text}</Typography>
                </Box>
              </Box>
            );
          })}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      {/* Input Section - Fixed at Bottom */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          p: 2,
          bgcolor: "background.paper",
          borderTop: `1px solid ${borderColor}`,
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          fullWidth
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 0.5,
              bgcolor: "background.paper",
            },
          }}
        />
        <IconButton
          type="submit"
          sx={{
            bgcolor: "primary.main",
            color: "#fff",
            "&:hover": {
              bgcolor: "primary.dark",
            },
            width: 45,
            height: 45,
            borderRadius: "10%",
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default ChatBar;
