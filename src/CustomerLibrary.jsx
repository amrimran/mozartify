import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  ListItemButton,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FeedbackIcon from "@mui/icons-material/Feedback";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { Link } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import SidebarMozartifyLogo from "./assets/mozartify.png";

export default function CustomerLibrary() {
  const username = "Nifail Amsyar"; // Replace with dynamic username

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
    { path: "/customer-feedback", label: "Feedback", icon: <FeedbackIcon /> },
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
              pt:5
            }}
          >
            <img src={SidebarMozartifyLogo} alt="MozartifyIcon" style={{ maxWidth: "100%", maxHeight: "48px" }} />

            <Typography variant="h6" sx={{ mt: 2, fontFamily:"Montserrat" }}>
              Mozartify
            </Typography>
          </Box>
          <List>
            {navigationItems.map((item) => (
              <ListItemButton key={item.path}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <Link to={item.path} style={{ textDecoration: "none" }}>
                  <ListItemText primary={item.label} />
                </Link>
              </ListItemButton>
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
            <Typography variant="h4">Library</Typography>
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
