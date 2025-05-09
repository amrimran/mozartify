import React, { useEffect, useState } from "react";
import axios from "axios"; // Add axios import
import {
  Box,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import MailIcon from "@mui/icons-material/Mail";
import GroupIcon from "@mui/icons-material/Group";
import ScoreIcon from "@mui/icons-material/Score";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SidebarMozartifyLogo from "./assets/mozartify.png";
import SearchIcon from "@mui/icons-material/Search";

import { useUnread } from "./UnreadContext.jsx";
axios.defaults.withCredentials = true;

const AdminSidebar = ({ active }) => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const { unreadCount, setUnreadCount } = useUnread();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:3000/current-user");
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching current user:", error);
        navigate("/login");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchFeedbackData = async () => {
      if (!user?._id) return;

      try {
        const response = await axios.get(
          `http://localhost:3002/api/feedback/all`
        );

        const unreadMessages = response.data.filter(
          (feedback) => !feedback.isReadAdmin
        ).length;

        setUnreadCount(unreadMessages); // Update context state
      } catch (error) {
        console.error("Error fetching feedback count data:", error);
      }
    };

    fetchFeedbackData();
  }, [user?._id, active]);

  const getUnreadFeedbackCount = () => unreadCount;

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

  const mainNavigationItems = [
    {
      path: "/admin-dashboard",
      label: "Dashboard",
      icon: <HomeIcon />,
      key: "dashboard",
    },
    {
      path: "/admin-inbox",
      label: "Inbox",
      icon: <MailIcon />,
      isInbox: true,
      key: "inbox",
    },
    {
      path: "/admin-manage-users",
      label: "Manage User",
      icon: <GroupIcon />,
      key: "manage-users",
    },
    {
      path: "/admin-manage-scores",
      label: "Manage Scores",
      icon: <ScoreIcon />,
      key: "manage-scores",
    },
    {
      path: "/admin-search",
      label: "Search Scores",
      icon: <SearchIcon />,
      key: "search-scores",
    },
  ];

  const bottomNavigationItems = [
    {
      path: "/admin-profile",
      label: "User Profile",
      icon: <AccountCircleIcon />,
      key: "user-profile",
    },
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
              animation: "moveUpDown 2s ease-in-out infinite",
            }}
          />
        </Box>
        <List sx={{ flexGrow: 1 }}>
          {mainNavigationItems.map((item) => (
            <ListItemButton
              key={item.path}
              onClick={() => handleNavigation(item.path, item.key)}
              sx={{
                bgcolor:
                  active === item.key || location.pathname === item.path
                    ? "#67ADC1"
                    : "inherit",
                color: "#FFFFFF",
                "&:hover": {
                  bgcolor:
                    active === item.key || location.pathname === item.path
                      ? "#67ADC1"
                      : "#78BBCC",
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
              {item.isInbox && getUnreadFeedbackCount() > 0 && (
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    color: "white",
                    backgroundColor: "red",
                    padding: "2px 6px",
                    borderRadius: "8px",
                    ml: 1, // Add some margin-left for spacing
                    display: "inline-block",
                  }}
                >
                  {unreadCount}
                </Typography>
              )}
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
                    ? "#67ADC1"
                    : "inherit",
                color: "#FFFFFF",
                "&:hover": {
                  bgcolor:
                    active === item.key || location.pathname === item.path
                      ? "#67ADC1"
                      : "#78BBCC",
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
    </Box>
  );
};

export default AdminSidebar;
