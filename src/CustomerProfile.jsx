import React, { useEffect, useState} from "react";
import {
  Box,
  List,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  ListItemButton,
} from "@mui/material";
import {
  Home as HomeIcon,
  LibraryBooks as LibraryBooksIcon,
  Favorite as FavoriteIcon,
  ShoppingCart as ShoppingCartIcon,
  Feedback as FeedbackIcon,
  AccountCircle as AccountCircleIcon,
  ExitToApp as ExitToAppIcon,
} from "@mui/icons-material";

import axios from "axios";
import { Link } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import SidebarMozartifyLogo from "./assets/mozartify.png";

export default function CustomerProfile() {
  const [username, setUsername] = useState("");
  const userId = "6663a93dd0f65edd4857eb95";

  useEffect(() => {
    axios
      .get(`http://localhost:3001/user/${userId}`)
      .then((response) => {
        setUsername(response.data.username); 
      })
      .catch((error) => {
        console.error("Error fetching user details:", error);
      });
  }, []); 
  const navigationItems = [
    { path: "/customer-homepage", label: "My Dashboard", icon: <HomeIcon /> },
    {
      path: "/customer-library",
      label: "Libraries",
      icon: <LibraryBooksIcon />,
    },
    {
      path: "/customer-favourites",
      label: "Favourites",
      icon: <FavoriteIcon />,
    },
    { path: "/customer-mycart", label: "My Cart", icon: <ShoppingCartIcon /> },
    { path: "/customer-inbox", label: "Inbox", icon: <FeedbackIcon /> },
    {
      path: "/customer-profile",
      label: "Customer Profile",
      icon: <AccountCircleIcon />,
    },
    { path: "/login", label: "Logout", icon: <ExitToAppIcon /> },
  ];

  const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
`;

  return (
    <>
      <GlobalStyle />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Box sx={{ width: 225, bgcolor: "#E4DCC8", p: 2 }}>
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
              style={{ maxWidth: "100%", maxHeight: "48px" }}
            />

            <Typography variant="h6" sx={{ mt: 2, fontFamily: "Montserrat" }}>
              Mozartify
            </Typography>
          </Box>
          <List>
            {navigationItems.map((item) => (
              <Link
                to={item.path}
                style={{ textDecoration: "none" }}
                key={item.path}
              >
                <ListItemButton>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </Link>
            ))}
          </List>
        </Box>
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6">Welcome to Mozartify</Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {username}
              </Typography>
              <Avatar>{username[0]}</Avatar>
            </Box>
          </Box>
          <Box>
            <Typography variant="h4">Profile</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Welcome to your dashboard. Here you can manage your libraries,
              favourites, cart, and more.
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
}
