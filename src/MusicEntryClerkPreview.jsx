import React from "react";
import { Box, Typography, Button, List, ListItemIcon, ListItemText, ListItemButton, Avatar } from "@mui/material";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import HomeIcon from "@mui/icons-material/Home";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SidebarMozartifyLogo from "./assets/mozartify.png";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
`;

export default function MusicEntryClerkPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { file, fileName } = location.state;
  const username = "Nifail Amsyar";

  const handleEdit = () => {
    alert("Edit functionality is not implemented yet.");
  };

  const handleProceed = () => {
    alert("Digitization completed. Please fill the metadata on next page.");
    navigate("/clerk-catalog", { state: { file: file, fileName: fileName } });
    };

  const navigationItems = [
    { path: "/clerk-homepage", label: "My Dashboard", icon: <HomeIcon /> },
    { path: "/clerk-upload", label: "Upload", icon: <CloudUploadIcon /> },
    { path: "/clerk-profile", label: "User Profile", icon: <AccountCircleIcon /> },
    { path: "/login", label: "Logout", icon: <ExitToAppIcon /> },
  ];

  return (
    <>
      <GlobalStyle />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Box sx={{ width: 435, bgcolor: "#E4DCC8", p: 2 }}>
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
            <img src={SidebarMozartifyLogo} alt="MozartifyIcon" style={{ maxWidth: "100%", maxHeight: "48px" }} />
            <Typography variant="h6" sx={{ mt: 2, fontFamily: "Montserrat" }}>
              Mozartify
            </Typography>
          </Box>
          <List>
            {navigationItems.map((item) => (
              <ListItemButton key={item.path}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <Link to={item.path} style={{ textDecoration: "none", color: "inherit" }}>
                  <ListItemText primary={item.label} />
                </Link>
              </ListItemButton>
            ))}
          </List>
        </Box>
        <Box sx={{ flexGrow: 1, p: 3, display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h4" sx={{ fontFamily: "Montserrat" }}>
              Music Score Preview
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {username}
              </Typography>
              <Avatar>{username[0]}</Avatar>
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexGrow: 1 }}>
            <Box sx={{ width: "50%", textAlign: "center", p: 3 }}>
            <img src={`http://localhost:3002${file}`} alt={fileName} style={{ maxWidth: "55%", height: "auto", border: "1px solid #ccc", borderRadius: 8 }} />
            </Box>
            <Box sx={{ width: "40%", textAlign: "center", p: 3, display: "flex", flexDirection: "column", justifyContent: "center", bgcolor: "#f8f8f8", borderRadius: 8 }}>
              <Typography variant="h6" sx={{ mb: 2, fontFamily: "Montserrat", color: "red", fontWeight: "bold" }}>
                ATTENTION!
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: "Montserrat", mb: 3 }}>
                Please <strong>double-check</strong> the music notation on the physical music score sheet against the scanned music score sheet preview.
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    flexGrow: 1,
                    mx: 1,
                    fontFamily: "Montserrat",
                    fontWeight: "bold",
                    color: "#483C32",
                    borderColor: "#483C32",
                    "&:hover": {
                      backgroundColor: "#483C32",
                      color: "#FFFFFF",
                      borderColor: "#483C32",
                    },
                  }}
                  onClick={handleEdit}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    flexGrow: 1,
                    mx: 1,
                    fontFamily: "Montserrat",
                    fontWeight: "bold",
                    color: "#483C32",
                    borderColor: "#483C32",
                    "&:hover": {
                      backgroundColor: "#483C32",
                      color: "#FFFFFF",
                      borderColor: "#483C32",
                    },
                  }}
                  onClick={handleProceed}
                >
                  Proceed
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}