import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  List,
  ListItemIcon,
  ListItemText,
  Typography,
  ListItemButton,
} from "@mui/material";

import {
  Home,
  LibraryBooks,
  Favorite,
  ShoppingCart,
  Feedback,
  AccountCircle,
  ExitToApp,
  Search,
  EditNote,
  ChangeCircle,
} from "@mui/icons-material";
import SidebarMozartifyLogo from "./assets/mozartify.png";
import { useUnread } from "./UnreadContext.jsx";
import { API_BASE_URL} from './config/api.js';


const CustomerSidebar2 = ({ active }) => {
  const currentPath = window.location.pathname;
  const [user, setUser] = useState(null);
  const { unreadCount, setUnreadCount } = useUnread();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/current-user`);
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
          `${API_BASE_URL}/api/feedback?userId=${user._id}`
        );

        const unreadMessages = response.data.filter(
          (feedback) => !feedback.isReadCustomer
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
        await axios.get(`${API_BASE_URL}/logout`, {
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
      path: "/customer-homepage-2",
      label: "Dashboard",
      icon: <Home />,
      key: "home",
    },
    {
      path: "/customer-library-2",
      label: "Libraries",
      icon: <LibraryBooks />,
      key: "library",
    },
    {
      path: "/customer-search-2",
      label: "Search",
      icon: <Search />,
      key: "search",
    },
    // {
    //   path: "/customer-collections",
    //   label: "Collections",
    //   icon: <Folder />,
    //   key: "collections",
    // },

    {
      path: "/customer-favorites-2",
      label: "Favorites",
      icon: <Favorite />,
      key: "favorites",
    },
    {
      path: "/customer-mycart-2",
      label: "My Cart",
      icon: <ShoppingCart />,
      key: "cart",
    },
    {
      path: "/customer-inbox-2",
      label: "Inbox",
      icon: <Feedback />,
      isInbox: true,
      key: "inbox",
    },
  ];

  const bottomNavigationItems = [
    {
          path: "/customer-homepage",
          label: "Music InstaLogin",
          icon: <ChangeCircle />,
          key: "music",
        },
    {
      path: "/customer-profile-2",
      label: "User Profile",
      icon: <AccountCircle />,
      key: "profile",
    },
    { path: "/login", label: "Logout", icon: <ExitToApp />, key: "logout" },
  ];

  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        display: "flex",
        height: "100vh",
        zIndex: 1000,
      }}
    >
      <Box
        sx={{
          width: 225,
          bgcolor: "#FFB6A5",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            mb: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pt: 5,
            animation: "moveUpDown 2s ease-in-out infinite",
            "@keyframes moveUpDown": {
              "0%": { transform: "translateY(0)" },
              "50%": { transform: "translateY(-10px)" },
              "100%": { transform: "translateY(0)" },
            },
          }}
        >
          <img
            src={SidebarMozartifyLogo}
            alt="MozartifyIcon"
            style={{
              maxWidth: "100%",
              maxHeight: "90px",
            }}
          />
        </Box>

        <List sx={{ flexGrow: 1 }}>
          {navigationItems.map((item) => (
            <ListItemButton
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                bgcolor: active === item.key ? "#FF9F8F" : "inherit",
                color: "#FFFFFF",
                "&:hover": {
                  bgcolor: active === item.key ? "#FF9F8F" : "#FF9F8F",
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

        <Box sx={{ mt: "auto", pb: 2 }}>
          <List>
            {bottomNavigationItems.map((item) => (
              <ListItemButton
                key={item.path}
                onClick={() => handleNavigation(item.path, item.key)} // Pass the key to identify logout
                sx={{
                  bgcolor:
                    active === item.key || currentPath === item.path
                      ? "#FF9F8F"
                      : "inherit",
                  color: "#FFFFFF",
                  "&:hover": {
                    bgcolor:
                      active === item.key || currentPath === item.path
                        ? "#FF9F8F"
                        : "#FFB6A5",
                  },
                  padding: "8px 16px",
                  display: "flex",
                  gap: 0,
                }}
              >
                <ListItemIcon
                  sx={{ color: "#FFFFFF", minWidth: "40px", ml: 3 }}
                >
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
      <Box sx={{ width: "4px", bgcolor: "#FFEE8C", height: "100%" }} />
    </Box>
  );
};

export default CustomerSidebar2;
