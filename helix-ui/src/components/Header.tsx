import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Avatar,
  Typography,
  
  IconButton,
  Menu,
  MenuItem,
  Box,
  Switch,
  useTheme,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

interface HeaderProps {
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleTheme, isDarkMode }) => {
  const theme = useTheme();

  const [helpAnchorEl, setHelpAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);

  const handleHelpClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setHelpAnchorEl(event.currentTarget);
  };
  const handleHelpClose = () => {
    setHelpAnchorEl(null);
  };

  const handleSettingsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };
  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  // 1. Decide a glass background for light or dark
  const headerBackground =
    theme.palette.mode === "dark"
      ? "linear-gradient(180deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2))"
      : "linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3))";

  // 2. Decide border color
  const borderColor =
    theme.palette.mode === "light"
      ? "rgba(255,255,255,0.1)"
      : "rgba(255,255,255,0.3)";

  return (
    <AppBar
      position="static"
      sx={{
        // Glass style depending on theme
        background: headerBackground,
        backdropFilter: "blur(10px)",
        border: `1px solid ${borderColor}`,
        borderRadius: 1,
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        color: "text.primary",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Logo and title */}
        <Box display="flex" alignItems="center">
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: "rgba(255,255,255,0.4)",
              mr: 1,
              color: "text.primary",
            }}
          >
            H
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600,color: "text.primary" }}>
              Helix
            </Typography>
            
          </Box>
        </Box>

        {/* Navigation actions */}
        <Box display="flex" alignItems="center">
          {/* Theme Switch */}
          <Switch
            checked={isDarkMode}
            onChange={onToggleTheme}
            color="primary"
            sx={{ mr: 2 }}
          />

          {/* Help Dropdown */}
          <IconButton onClick={handleHelpClick} sx={{ color: "text.primary" }}>
            <HelpOutlineIcon />
          </IconButton>
          <Menu
            anchorEl={helpAnchorEl}
            open={Boolean(helpAnchorEl)}
            onClose={handleHelpClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={handleHelpClose}>How to use Helix</MenuItem>
            <MenuItem onClick={handleHelpClose}>About Helix HR Agent</MenuItem>
            <MenuItem onClick={handleHelpClose}>Contact Support</MenuItem>
          </Menu>

          {/* Settings Dropdown */}
          <IconButton onClick={handleSettingsClick} sx={{ color: "text.primary" }}>
            <SettingsIcon />
          </IconButton>
          <Menu
            anchorEl={settingsAnchorEl}
            open={Boolean(settingsAnchorEl)}
            onClose={handleSettingsClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={handleSettingsClose}>Profile Settings</MenuItem>
            <MenuItem onClick={handleSettingsClose}>Notification Preferences</MenuItem>
            <MenuItem onClick={handleSettingsClose}>Theme Settings</MenuItem>
          </Menu>

          {/* User Icon */}
          <IconButton sx={{ color: "text.primary" }}>
            <AccountCircleIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
