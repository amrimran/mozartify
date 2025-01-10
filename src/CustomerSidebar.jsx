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

const CustomerSidebar = ({ active }) => {
  const location = useLocation();
  const navigationItems = [
    {
      path: "/customer-homepage",
      label: "Dashboard",
      icon: <Home />,
      key: "home",
    },
    {
      path: "/customer-library",
      label: "Libraries",
      icon: <LibraryBooks />,
      key: "library",
    },
    {
      path: "/customer-search",
      label: "Search",
      icon: <Search />,
      key: "search",
    },
    {
      path: "/customer-favorites",
      label: "Favorites",
      icon: <Favorite />,
      key: "favorites",
    },
    {
      path: "/customer-mycart",
      label: "My Cart",
      icon: <ShoppingCart />,
      key: "cart",
    },
    {
      path: "/customer-inbox",
      label: "Inbox",
      icon: <Feedback />,
      isInbox: true,
      key: "inbox",
    },
  ];

  const bottomNavigationItems = [
    {
      path: "/customer-profile",
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
        <List sx={{ flexGrow: 1 }}>
          {navigationItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
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
      {/* Thin yellow line */}
      <Box sx={{ width: "4px", bgcolor: "#FFEE8C", height: "100%" }} />
    </Box>
  );
};

export default CustomerSidebar;
