import React from "react";
import { Box, List, ListItemIcon, ListItemText, ListItemButton, Typography } from "@mui/material";
import { useLocation, Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import MailIcon from "@mui/icons-material/Mail";
import GroupIcon from "@mui/icons-material/Group";
import ScoreIcon from "@mui/icons-material/Score";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SidebarMozartifyLogo from "./assets/mozartify.png";

const AdminSidebar = ({ active }) => {
  const location = useLocation();
  const navigationItems = [
    { path: "/admin-dashboard", label: "Dashboard", icon: <HomeIcon />, key: "dashboard" },
    { path: "/admin-inbox", label: "Inbox", icon: <MailIcon />, key: "inbox" },
    { path: "/admin-manage-users", label: "Manage User", icon: <GroupIcon />, key: "manage-users" },
    { path: "/admin-manage-scores", label: "Manage Scores", icon: <ScoreIcon />, key: "manage-scores" },
    { path: "/admin-profile", label: "User Profile", icon: <AccountCircleIcon />, key: "user-profile" },
    { path: "/login", label: "Logout", icon: <ExitToAppIcon />, key: "logout" },
  ];

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
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
          <img src={SidebarMozartifyLogo} alt="MozartifyIcon" style={{ maxWidth: "100%", maxHeight: "90px" }} />
        </Box>
        <List sx={{ flexGrow: 1 }}>
          {navigationItems.map((item) => (
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
    </Box>
  );
};

export default AdminSidebar;