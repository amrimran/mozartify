import React from "react";
import axios from "axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
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
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import SidebarMozartifyLogo from "./assets/mozartify.png";

axios.defaults.withCredentials = true;

const CustomerSidebar = () => {
  const location = useLocation();
  const navigationItems = [
    { path: "/customer-homepage", label: "Dashboard", icon: <Home /> },
    { path: "/customer-library", label: "Libraries", icon: <LibraryBooks /> },
    { path: "/customer-search", label: "Search", icon: <Search /> },
    { path: "/customer-favorites", label: "Favorites", icon: <Favorite /> },
    { path: "/customer-mycart", label: "My Cart", icon: <ShoppingCart /> },
    {path: "/customer-inbox", label: "Inbox", icon: <Feedback />, isInbox: true,},
  ];

  const bottomNavigationItems = [
    {
      path: "/customer-profile",
      label: "User Profile",
      icon: <AccountCircle />,
    },
    { path: "/login", label: "Logout", icon: <ExitToApp /> },
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
      {" "}
      {/* Blue sidebar */}
      <Box
        sx={{
          width: 225,
          bgcolor: "#8BD3E6",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflowY: "auto", // Enable scrolling if content is too long
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
        {/* Main navigation */}
        <List sx={{ flexGrow: 1, pb: 2 }}>
          {navigationItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              sx={{
                bgcolor:
                  (item.isInbox &&
                    (location.pathname === "/customer-inbox" ||
                      location.pathname ===
                        "/customer-inbox/customer-add-new-feedback")) ||
                  location.pathname === item.path
                    ? "#67ADC1"
                    : "inherit",
                color: "#FFFFFF",
                "&:hover": {
                  bgcolor:
                    (item.isInbox &&
                      (location.pathname === "/customer-inbox" ||
                        location.pathname ===
                          "/customer-inbox/customer-add-new-feedback")) ||
                    location.pathname === item.path
                      ? "#67ADC1"
                      : "#78BBCC",
                },
                display: "flex",
                alignItems: "center",
              }}
            >
              <ListItemIcon sx={{ color: "#FFFFFF", minWidth: "auto", ml: 3 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontFamily: "Montserrat", ml: 2 }}>
                    {item.label}
                  </Typography>
                }
              />
            </ListItemButton>
          ))}
        </List>

        {/* Bottom navigation - now in a container that sticks to the bottom */}
        <Box sx={{ mt: "auto", pb: 2 }}>
          <List>
            {bottomNavigationItems.map((item) => (
              <ListItemButton
                key={item.path}
                component={Link}
                to={item.path}
                sx={{
                  bgcolor:
                    location.pathname === item.path ? "#67ADC1" : "inherit",
                  color: "#FFFFFF",
                  "&:hover": {
                    bgcolor:
                      location.pathname === item.path ? "#78BBCC" : "#67ADC1",
                  },
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ListItemIcon
                  sx={{ color: "#FFFFFF", minWidth: "auto", ml: 3 }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ fontFamily: "Montserrat", ml: 2 }}>
                      {item.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Box>
      {/* Thin yellow line */}
      <Box sx={{ width: "4px", bgcolor: "#FFEE8C", height: "100%" }} />
    </Box>
  );
};

export default CustomerSidebar;
