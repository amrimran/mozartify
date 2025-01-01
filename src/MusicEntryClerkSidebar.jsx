import React, { useState } from "react";
import { Box, List, ListItemIcon, ListItemText, ListItemButton, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";
import { useLocation, Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import EditIcon from "@mui/icons-material/Edit";
import ViewListIcon from "@mui/icons-material/ViewList";
import SidebarMozartifyLogo from "./assets/mozartify.png";
import { useNavigate } from "react-router-dom"; // Import useNavigate at the top


const ClerkSidebar = ({ active, disableActiveTab }) => {
  const location = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate


  const navigationItems = [
    { path: "/clerk-homepage", label: "Dashboard", icon: <HomeIcon />, key: "dashboard" },
    { path: "/clerk-upload", label: "Upload", icon: <CloudUploadIcon />, key: "upload" },
    { path: "/clerk-music-score-view", label: "Manage Scores", icon: <LibraryMusicIcon />, key: "manageScore" },
    { path: "/clerk-edit", label: "Edit Score", icon: <EditIcon />, key: "editScore" },
    { path: "/clerk-catalog", label: "Edit Metadata", icon: <ViewListIcon />, key: "catalogMetadata" },
  ];

  const bottomNavigationItems = [
    { path: "/clerk-profile", label: "User Profile", icon: <AccountCircleIcon />, key: "profile" },
    { path: "/login", label: "Logout", icon: <ExitToAppIcon />, key: "logout" },
  ];

  // Define keyframes for the animation
  const keyframes = `
    @keyframes moveUpDown {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
      100% { 
      transform: translateY(0) };
    }
  `;

  const handleTabClick = (tabKey) => {
    // Open dialog for specific tabs unless they are the active one
    if (["manageScore", "editScore", "catalogMetadata"].includes(tabKey) && tabKey !== active) {
      setDialogOpen(true);
    } else if (tabKey !== active) {
      const targetPath = navigationItems.find((item) => item.key === tabKey)?.path;
      if (targetPath) {
        window.location.href = targetPath;
      }
    }
  };

  const isDisabled = (key) => {
    // Always allow interaction for 'dashboard' and 'upload'
    if (key === "dashboard" || key === "upload") {
      return false;
    }
  
    // Disable tabs other than the active one for certain conditions
    if (
      (active === "manageScore" && key === "editScore") ||
      (active === "manageScore" && key === "catalogMetadata") ||
      (active === "editScore" && key === "manageScore") ||
      (active === "editScore" && key === "catalogMetadata") ||
      (active === "catalogMetadata" && key === "manageScore") ||
      (active === "catalogMetadata" && key === "editScore")
    ) {
      return true;
    }
  
    return false;
  };
  


  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
            <style>{keyframes}</style>

      <Box
        sx={{
          width: 225,
          bgcolor: "#8BD3E6",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minHeight: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
        }}
      >
        <Box 
                  sx={{ 
                    width: "4px", 
                    bgcolor: "#FFEE8C", 
                    height: "100%", 
                    position: "fixed", 
                    left: "225px", 
                    top: 0,
                  }} 
                />
        <Box
          sx={{
            textAlign: "center",
            mb: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pt: 5,
          }}
        >
          <img
            src={SidebarMozartifyLogo}
            alt="MozartifyIcon"
            style={{
              maxWidth: "100%",
              maxHeight: "90px",
              animation: "moveUpDown 2s ease-in-out infinite"

            }}
          />
        </Box>
         <List sx={{ flexGrow: 1 }}>
          {navigationItems.map((item) => (
            <ListItemButton
              key={item.path}
              onClick={() => handleTabClick(item.key)}
              disabled={isDisabled(item.key)}
              sx={{
                bgcolor: active === item.key ? "#67ADC1" : "inherit",
                color: "#FFFFFF",
                "&:hover": {
                  bgcolor: active === item.key ? "#67ADC1" : "#78BBCC",
                },
                padding: "8px 16px",
                display: "flex",
                gap: 0,
              }}
            >
              <ListItemIcon sx={{ color: "#FFFFFF", minWidth: "40px", ml: 3 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontFamily: "Montserrat" }}>
                    {item.label}
                  </Typography>
                }
              />
            </ListItemButton>
          ))}
        </List>


        <List>
          {bottomNavigationItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              sx={{
                bgcolor: active === item.key || location.pathname === item.path ? "#67ADC1" : "inherit",
                color: "#FFFFFF",
                "&:hover": {
                  bgcolor: active === item.key || location.pathname === item.path ? "#67ADC1" : "#78BBCC",
                },
                padding: "8px 16px",
                display: "flex",
                gap: 0,
              }}
            >
              <ListItemIcon sx={{ color: "#FFFFFF", minWidth: "40px", ml: 3 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontFamily: "Montserrat" }}>
                    {item.label}
                  </Typography>
                }
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Dialog Component */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            padding: "16px",
            fontFamily: "Montserrat",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "Montserrat",
            fontWeight: "bold",
            fontSize: "20px",
            textAlign: "center",
          }}
        >
          Attention
        </DialogTitle>
        <DialogContent
          sx={{
            fontFamily: "Montserrat",
            textAlign: "center",
          }}
        >
          <DialogContentText
            sx={{
              fontFamily: "Montserrat",
              fontSize: "16px",
              color: "#555",
            }}
          >
            Choose a score to proceed.
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            gap: "12px",
            marginTop: "8px",
          }}
        >
          <Button
onClick={() => {
  setDialogOpen(false); // Close the dialog
  navigate("/clerk-homepage"); // Redirect to the dashboard
}}            sx={{
              textTransform: "none",
              fontFamily: "Montserrat",
              fontWeight: "bold",
              color: "#3B3183",
              border: "1px solid #3B3183",
              borderRadius: "8px",
              padding: "8px 24px",
              "&:hover": {
                bgcolor: "#ECEFF1",
              },
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClerkSidebar;
