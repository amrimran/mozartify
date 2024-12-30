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
    { path: "/customer-homepage", label: "My Dashboard", icon: <Home /> },
    { path: "/customer-library", label: "Libraries", icon: <LibraryBooks /> },
    { path: "/customer-search", label: "Search", icon: <Search /> },
    { path: "/customer-favorites", label: "Favorites", icon: <Favorite /> },
    { path: "/customer-mycart", label: "My Cart", icon: <ShoppingCart /> },
    {
      path: "/customer-inbox",
      label: "Inbox",
      icon: <Feedback />,
      isInbox: true, // Add a flag to identify the Inbox item
    },
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
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Blue sidebar */}
      <Box
        sx={{
          width: 225,
          bgcolor: "#8BD3E6",
          display: "flex",
          flexDirection: "column",
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
              "50%": { transform: "translateY(-10px)" }, // Move up by 10px
              "100%": { transform: "translateY(0)" }, // Move back to original position
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

                display: "flex", // Ensures the icon and text are aligned in one line
                alignItems: "center", // Centers the items vertically
              }}
            >
              <ListItemIcon
                sx={{
                  color: "#FFFFFF",
                  minWidth: "auto", // Prevents extra space between icon and text
                  padding: 0,
                  ml: 3,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    sx={{
                      fontFamily: "Montserrat",
                      marginLeft: "10px", // Small gap between icon and text
                      padding: 0, // Remove padding from text
                    }}
                  >
                    {item.label}
                  </Typography>
                }
              />
            </ListItemButton>
          ))}
        </List>

        {/* Bottom Navigation Items */}
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
              <ListItemIcon sx={{ color: "#FFFFFF", padding: 0, ml: 3 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontFamily: "Montserrat", padding: 0 }}>
                    {item.label}
                  </Typography>
                }
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Thin yellow line on the right */}
      <Box sx={{ width: "4px", bgcolor: "#FFEE8C" }} />
    </Box>
  );
};

export default CustomerSidebar;
