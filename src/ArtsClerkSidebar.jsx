import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { useLocation, Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ImageIcon from "@mui/icons-material/Image";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import ViewListIcon from "@mui/icons-material/ViewList";
import BrushIcon from "@mui/icons-material/Brush";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import SidebarMozartifyLogo from "./assets/mozartify.png";
import { useNavigate } from "react-router-dom";

const ArtsClerkSidebar = ({ active, disableActiveTab }) => {
  const location = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = async (path, key) => {
    if (key === "logout") {
      try {
        // Call the backend logout endpoint
        await axios.get("http://localhost:3000/logout", {
          withCredentials: true,
        });

        // Clear any client-side session-related data if needed
        localStorage.removeItem("loggedInUserId");

        // Redirect to the login page
        window.location.href = "/login";
      } catch (error) {
        console.error("Error during logout:", error);
        alert("Failed to log out. Please try again.");
      }
    } else {
      window.location.href = path;
    }
  };

  const navigationItems = [
    {
      path: "/arts-clerk-homepage",
      label: "Dashboard",
      icon: <HomeIcon />,
      key: "dashboard",
    },
    {
      path: "/arts-clerk-upload",
      label: "Upload Artwork",
      icon: <CloudUploadIcon />,
      key: "upload",
    },
    {
      path: "/arts-clerk-search",
      label: "Search Gallery",
      icon: <SearchIcon />,
      key: "searchArtwork",
    },
    {
      path: "/arts-clerk-artwork-view",
      label: "Manage Gallery",
      icon: <ImageIcon />,
      key: "manageArtwork",
    },
  
    {
      path: "/arts-clerk-catalog",
      label: "Edit Metadata",
      icon: <ViewListIcon />,
      key: "catalogMetadata",
    },
  ];

  const bottomNavigationItems = [
    {
      path: "/arts-clerk-profile",
      label: "User Profile",
      icon: <AccountCircleIcon />,
      key: "profile",
    },
    {
      path: "/login",
      label: "Logout",
      icon: <ExitToAppIcon />,
      key: "logout",
    },
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
    if (
      ["manageArtwork", "editArtwork", "catalogMetadata"].includes(tabKey) &&
      tabKey !== active
    ) {
      setDialogOpen(true);
    } else if (tabKey !== active) {
      const targetItem = navigationItems.find((item) => item.key === tabKey);
      if (targetItem) {
        handleNavigation(targetItem.path, targetItem.key);
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
      (active === "manageArtwork" && key === "editArtwork") ||
      (active === "manageArtwork" && key === "catalogMetadata") ||
      (active === "editArtwork" && key === "manageArtwork") ||
      (active === "editArtwork" && key === "catalogMetadata") ||
      (active === "catalogMetadata" && key === "manageArtwork") ||
      (active === "catalogMetadata" && key === "editArtwork")
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
          bgcolor: "#FFB6C1", // Changed to soft pink
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
            alt="ArtsLogo"
            style={{
              maxWidth: "100%",
              maxHeight: "90px",
              animation: "moveUpDown 2s ease-in-out infinite",
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
                bgcolor: active === item.key ? "#FFA0B3" : "inherit", // Darker pink for active
                color: "#FFFFFF",
                "&:hover": {
                  bgcolor: active === item.key ? "#FFA0B3" : "#FFB6C1B0", // Slightly transparent pink for hover
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
              onClick={() => handleNavigation(item.path, item.key)}
              sx={{
                bgcolor:
                  active === item.key || location.pathname === item.path
                    ? "#FFA0B3"
                    : "inherit",
                color: "#FFFFFF",
                "&:hover": {
                  bgcolor:
                    active === item.key || location.pathname === item.path
                      ? "#FFA0B3"
                      : "#FFB6C1B0",
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
            Choose an artwork to proceed.
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
              navigate("/arts-clerk-homepage"); // Redirect to the dashboard
            }}
            sx={{
              textTransform: "none",
              fontFamily: "Montserrat",
              fontWeight: "bold",
              color: "white",
              background: "#FFB6C1", // Changed to soft pink
              border: "1px solid #FFB6C1",
              borderRadius: "8px",
              padding: "8px 24px",
              "&:hover": {
                bgcolor: "#FFA0B3", // Darker pink for hover
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

export default ArtsClerkSidebar;