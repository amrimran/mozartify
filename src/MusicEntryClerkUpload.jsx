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
  CircularProgress,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { Link, useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import SidebarMozartifyLogo from "./assets/mozartify.png";
import ImportIcon from "./assets/import-icon.png";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
`;

const buttonStyles = {
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#483C32",
  borderColor: "#483C32",
  "&:hover": {
    backgroundColor: "#483C32",
    color: "#FFFFFF",
    borderColor: "#483C32",
  },
};

export default function MusicEntryClerkUpload() {
  const username = "Nifail Amsyar";
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const acceptedFileTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (file && acceptedFileTypes.includes(file.type)) {
      setSelectedFile(file);
      setUploadMessage("");
    } else {
      alert("Please select a valid image file (jpg, jpeg, png).");
      setSelectedFile(null);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    fetch('http://localhost:3002/upload', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        setIsUploading(false);
        if (data.filePath) {
          navigate("/clerk-preview", { state: { file: data.filePath, fileName: selectedFile.name } });
        } else {
          setUploadMessage("Error uploading file. Please try again.");
        }
      })
      .catch(error => {
        setIsUploading(false);
        setUploadMessage("Error uploading file. Please try again.");
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
            <Typography variant="h6">Music Entry Clerk</Typography>
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
              height: "calc(100% - 64px)",
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
                <img src={ImportIcon} alt="Import Icon" style={{ width: "100px", height: "100px" }} />
                <Typography variant="h6" sx={{ mt: 2, fontFamily: "Montserrat" }}>
                  Import from computer
                </Typography>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
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
                      ...buttonStyles,
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
                      ...buttonStyles,
                    }}
                    onClick={handleUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? <CircularProgress size={24} /> : "Upload"}
                  </Button>
                )}
                {uploadMessage && (
                  <Typography variant="body1" sx={{ mt: 2, color: 'red' }}>
                    {uploadMessage}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}