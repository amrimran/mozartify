import React from "react";
import { Box, List, ListItemIcon, ListItemText, ListItemButton, Typography } from "@mui/material";
import { useLocation, Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SidebarMozartifyLogo from "./assets/mozartify.png";

const ClerkSidebar = ({ active }) => {
  const location = useLocation();
  const navigationItems = [
    { path: "/clerk-homepage", label: "My Dashboard", icon: <HomeIcon />, key: "dashboard" },
    { path: "/clerk-upload", label: "Upload", icon: <CloudUploadIcon />, key: "upload" },
    { path: "/clerk-profile", label: "User Profile", icon: <AccountCircleIcon />, key: "profile" },
    { path: "/login", label: "Logout", icon: <ExitToAppIcon />, key: "logout" },
  ];

  return (
    <Box sx={{ width: 225, bgcolor: "#3B3183", display: "flex", flexDirection: "column", height: "auto" }}>
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
        <img src={SidebarMozartifyLogo} alt="MozartifyIcon" style={{ maxWidth: "100%", maxHeight: "90px" }} />
      </Box>
      <List sx={{ flexGrow: 1 }}>
        {navigationItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={Link}
            to={item.path}
            sx={{
              bgcolor: active === item.key || location.pathname === item.path ? "#DB2226" : "inherit",
              color: "#FFFFFF",
              "&:hover": {
                bgcolor: active === item.key || location.pathname === item.path ? "#DB2226" : "#4c41a3",
              },
              padding: 0,
            }}
          >
            <ListItemIcon sx={{ color: "#FFFFFF", padding: "8px 16px" }}>{item.icon}</ListItemIcon>
            <ListItemText 
              primary={
                <Typography sx={{ fontFamily: "Montserrat" }}>
                  {item.label}
                </Typography>
              } 
              sx={{ padding: "8px 0px" }} 
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default ClerkSidebar;
