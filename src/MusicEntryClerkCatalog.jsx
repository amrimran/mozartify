import React from "react";
import {
  Box,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
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

export default function MusicEntryClerkCatalog() {
  const username = "Nifail Amsyar"; // Replace with dynamic username
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { path: "/clerk-homepage", label: "My Dashboard", icon: <HomeIcon /> },
    { path: "/clerk-upload", label: "Upload", icon: <CloudUploadIcon /> },
    { path: "/clerk-profile", label: "User Profile", icon: <AccountCircleIcon /> },
    { path: "/login", label: "Logout", icon: <ExitToAppIcon /> },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const metadata = Object.fromEntries(formData.entries());
    metadata.filePath = location.state.file; // Add file path to metadata

    fetch('http://localhost:3002/catalog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    })
      .then(response => {
        if (response.ok) {
          alert("Metadata saved successfully!");
          navigate("/clerk-homepage");
        } else {
          alert("Error saving metadata");
        }
      })
      .catch(error => {
        console.error("Error saving metadata:", error);
      });
  };

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
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h4" sx={{ fontFamily: "Montserrat" }}>
              Catalog
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {username}
              </Typography>
              <Avatar>{username[0]}</Avatar>
            </Box>
          </Box>
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
              <TextField name="title" label="Title" variant="outlined" required fullWidth />
              <TextField name="artist" label="Artist(s)" variant="outlined" required fullWidth />
              <TextField name="composer" label="Composer" variant="outlined" required fullWidth />
              <TextField name="instrumentation" label="Instrumentation" variant="outlined" required fullWidth />
              <TextField name="genre" label="Genre" variant="outlined" required fullWidth />
              <TextField name="copyright" label="Copyright" variant="outlined" fullWidth />
              <TextField name="key" label="Key" variant="outlined" fullWidth />
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  Lyrics
                </Typography>
                <RadioGroup row name="lyricsProvided">
                  <FormControlLabel value="true" control={<Radio />} label="Provided" />
                  <FormControlLabel value="false" control={<Radio />} label="Not Provided" />
                </RadioGroup>
              </Box>
              <TextField name="historicalContext" label="Historical Context" variant="outlined" fullWidth multiline rows={4} />
              <TextField name="description" label="Description" variant="outlined" fullWidth multiline rows={4} />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
              <Button
                variant="outlined"
                size="large"
                type="submit"
                sx={{
                  px: 10,
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
              >
                Confirm & Upload
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
