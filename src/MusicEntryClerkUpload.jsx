import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios
import {
  Box,
  Avatar,
  Typography,
  Button,
  LinearProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import ClerkSidebar from "./ClerkSidebar";
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
  color: "#3B3183",
  borderColor: "#3B3183",
  "&:hover": {
    backgroundColor: "#3B3183",
    color: "#FFFFFF",
    borderColor: "#3B3183",
  },
};

export default function MusicEntryClerkUpload() {
  const [user, setUser] = useState(null); // State to store user data
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:3000/current-user");
        setUser(response.data); // Assuming the response contains user data with a `username` field
      } catch (error) {
        console.error("Error fetching current user:", error);
        navigate("/login"); // Redirect to login if there's an error
      }
    };

    fetchUser(); // Call the fetchUser function when the component mounts
  }, [navigate]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const acceptedFileTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (file && acceptedFileTypes.includes(file.type)) {
      setSelectedFile(file);
      setUploadMessage("");
    } else {
      alert("Please select a valid file (jpg, jpeg, png, pdf).");
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

    fetch('http://localhost:3001/upload', {
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

  return (
    <>
      <GlobalStyle />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <ClerkSidebar />
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Montserrat', fontWeight: 'bold', mt: 4, ml:1 }}>
            Digitize Music Scores
          </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ mr: 2, fontFamily: 'Montserrat' }}>
                {user ? user.username : "Loading..."}
              </Typography>
              <Avatar>{user ? user.username[0] : "?"}</Avatar>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "calc(100% - 64px)",
              mt: -5
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
                  accept=".jpg,.jpeg,.png,.pdf"
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
                      width: '100%',
                      ...buttonStyles,
                    }}
                  >
                    Choose File
                  </Button>
                </label>
                {selectedFile && (
                  <>
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{
                        mt: 2,
                        width: '100%',
                        ...buttonStyles,
                      }}
                      onClick={handleUpload}
                      disabled={isUploading}
                    >
                      Upload
                    </Button>
                    {isUploading && (
                      <Box sx={{ width: '100%', mt: 2 }}>
                        <LinearProgress />
                      </Box>
                    )}
                  </>
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
