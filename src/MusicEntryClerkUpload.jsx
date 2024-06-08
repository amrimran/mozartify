import React, { useState } from "react";
import {
  Box,
  List,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  ListItemButton,
  Button,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { Link, useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import SidebarMozartifyLogo from "./assets/mozartify.png";
import ScanIcon from "./assets/scan-icon.png"; // Placeholder for scan icon
import ImportIcon from "./assets/import-icon.png"; // Placeholder for import icon

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
`;

export default function MusicEntryClerkUpload() {
  const username = "Nifail Amsyar"; // Replace with dynamic username
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    fetch('http://localhost:3002/upload', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.filePath) {
          navigate("/clerk-preview", { state: { file: data.filePath, fileName: selectedFile.name } });
        }
      })
      .catch(error => {
        console.error("Error uploading file:", error);
      });
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
            <Typography variant="h6">Digitize</Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {username}
              </Typography>
              <Avatar>{username[0]}</Avatar>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "calc(100% - 64px)", // Adjust height to account for header
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                width: "80%",
              }}
            >
              <Box
                sx={{
                  textAlign: "center",
                  border: "2px solid #ccc",
                  borderRadius: 8,
                  padding: 4,
                  width: "40%",
                }}
              >
                <img src={ScanIcon} alt="Scan Icon" style={{ width: "100px", height: "100px" }} />
                <Typography variant="h6" sx={{ mt: 2, fontFamily: "Montserrat" }}>
                  Scan using scanner
                </Typography>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    mt: 5,
                    px: 10,
                    fontFamily: "Montserrat",
                    fontWeight: "bold",
                    color: "#483C32", // Custom text color for outlined button
                    borderColor: "#483C32", // Custom border color for outlined button
                    "&:hover": {
                      backgroundColor: "#483C32",
                      color: "#FFFFFF",
                      borderColor: "#483C32", // Ensures border is also set when hovered
                    },
                  }}
                >
                  Scan
                </Button>
              </Box>
              <Typography variant="h6" sx={{ fontFamily: "Montserrat" }}>
                OR
              </Typography>
              <Box
                sx={{
                  textAlign: "center",
                  border: "2px solid #ccc",
                  borderRadius: 8,
                  padding: 4,
                  width: "40%",
                }}
              >
                <img src={ImportIcon} alt="Import Icon" style={{ width: "100px", height: "100px" }} />
                <Typography variant="h6" sx={{ mt: 2, fontFamily: "Montserrat" }}>
                  Import from computer
                </Typography>
                <input
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="upload-button"
                />
                <label htmlFor="upload-button">
                  <Button
                    variant="outlined"
                    size="large"
                    component="span"
                    sx={{
                      mt: 5,
                      px: 10,
                      fontFamily: "Montserrat",
                      fontWeight: "bold",
                      color: "#483C32", // Custom text color for outlined button
                      borderColor: "#483C32", // Custom border color for outlined button
                      "&:hover": {
                        backgroundColor: "#483C32",
                        color: "#FFFFFF",
                        borderColor: "#483C32", // Ensures border is also set when hovered
                      },
                    }}
                  >
                    Choose File
                  </Button>
                </label>
                {selectedFile && (
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      mt: 2,
                      px: 10,
                      fontFamily: "Montserrat",
                      fontWeight: "bold",
                      color: "#483C32", // Custom text color for outlined button
                      borderColor: "#483C32", // Custom border color for outlined button
                      "&:hover": {
                        backgroundColor: "#483C32",
                        color: "#FFFFFF",
                        borderColor: "#483C32", // Ensures border is also set when hovered
                      },
                    }}
                    onClick={handleUpload}
                  >
                    Upload
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
