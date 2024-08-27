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
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import SidebarMozartifyLogo from "./assets/mozartify.png";

axios.defaults.withCredentials = true;

const CustomerSidebar = () => {
  const location = useLocation();
  const navigationItems = [
    { path: "/customer-homepage", label: "My Dashboard", icon: <Home /> },
    { path: "/customer-library", label: "Libraries", icon: <LibraryBooks /> },
    { path: "/customer-favorites", label: "Favorites", icon: <Favorite /> },
    { path: "/customer-mycart", label: "My Cart", icon: <ShoppingCart /> },
    { path: "/customer-inbox", label: "Inbox", icon: <Feedback /> },
  ];

  const bottomNavigationItems = [
    { path: "/customer-profile", label: "User Profile", icon: <AccountCircle /> },
    { path: "/login", label: "Logout", icon: <ExitToApp /> },
  ];

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Blue sidebar */}
      <Box
        sx={{
          width: 225,
          bgcolor: "#3B3183",
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
          }}
        >
          <img
            src={SidebarMozartifyLogo}
            alt="MozartifyIcon"
            style={{ maxWidth: "100%", maxHeight: "90px" }}
          />
        </Box>

        <List sx={{ flexGrow: 1 }}>
          {navigationItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              sx={{
                bgcolor: location.pathname === item.path ? "#DB2226" : "inherit",
                color: "#FFFFFF",
                "&:hover": {
                  bgcolor:
                    location.pathname === item.path ? "#DB2226" : "#4c41a3",
                },
                padding: 0,
              }}
            >
              <ListItemIcon sx={{ color: "#FFFFFF", padding: "8px 16px" }}>
                {item.icon}
              </ListItemIcon>
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

        {/* Bottom Navigation Items */}
        <List>
          {bottomNavigationItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              sx={{
                bgcolor: location.pathname === item.path ? "#DB2226" : "inherit",
                color: "#FFFFFF",
                "&:hover": {
                  bgcolor:
                    location.pathname === item.path ? "#DB2226" : "#4c41a3",
                },
                padding: 0,
              }}
            >
              <ListItemIcon sx={{ color: "#FFFFFF", padding: "8px 16px" }}>
                {item.icon}
              </ListItemIcon>
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

      {/* Thin yellow line on the right */}
      <Box sx={{ width: "4px", bgcolor: "#FFD700" }} />
    </Box>
  );
};

export default CustomerSidebar;
