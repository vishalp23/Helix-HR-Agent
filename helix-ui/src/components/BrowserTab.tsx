import React, { useState } from "react";
import { Box, TextField, Button, IconButton, Paper } from "@mui/material";
import { ArrowBack, ArrowForward, Refresh, Search } from "@mui/icons-material";

const PROXY_URL = "http://localhost:5000/api/proxy?url=";

interface BrowserTabProps {
  initialUrl?: string;
}

const BrowserTab: React.FC<BrowserTabProps> = ({ initialUrl = "https://www.google.com" }) => {
  const [url, setUrl] = useState<string>(initialUrl);
  const [proxyUrl, setProxyUrl] = useState<string>(PROXY_URL + encodeURIComponent(initialUrl));
  const [history, setHistory] = useState<string[]>([initialUrl]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const handleNavigation = (newUrl: string) => {
    if (!newUrl.startsWith("http://") && !newUrl.startsWith("https://")) {
      newUrl = `https://${newUrl}`;
    }

    setUrl(newUrl);
    setProxyUrl(PROXY_URL + encodeURIComponent(newUrl));

    const newHistory = [...history.slice(0, historyIndex + 1), newUrl];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setUrl(history[newIndex]);
      setProxyUrl(PROXY_URL + encodeURIComponent(history[newIndex]));
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setUrl(history[newIndex]);
      setProxyUrl(PROXY_URL + encodeURIComponent(history[newIndex]));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleNavigation(url);
  };

  return (
    <Paper sx={{ display: "flex", flexDirection: "column", height: "100%", p: 2 }}>
      {/* Navigation Controls */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <IconButton onClick={handleBack} disabled={historyIndex === 0}>
          <ArrowBack />
        </IconButton>
        <IconButton onClick={handleForward} disabled={historyIndex >= history.length - 1}>
          <ArrowForward />
        </IconButton>
        <IconButton onClick={() => handleNavigation(url)}>
          <Refresh />
        </IconButton>
        <form onSubmit={handleSubmit} style={{ flexGrow: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1 }} />,
            }}
          />
        </form>
        <Button variant="contained" onClick={() => handleNavigation(url)}>
          Go
        </Button>
      </Box>

      {/* Webpage Display (Using Proxy) */}
      <iframe
        src={proxyUrl}
        title="Browser"
        style={{ flexGrow: 1, width: "100%", border: "none" }}
      />
    </Paper>
  );
};

export default BrowserTab;
