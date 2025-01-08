import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Avatar,
  Typography,
  Button,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import ClerkSidebar from "./MusicEntryClerkSidebar";
import ImportIcon from "./assets/import-icon.png";
import { Divider } from "@mui/material";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
`;

const buttonStyles2 = {
  px: 10,
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#8BD3E6",
  backgroundColor: "#FFFFFF",
  border: "1px solid #8BD3E6",
  borderColor: "#8BD3E6",
  "&:hover": {
    backgroundColor: "#E6F8FB", // Subtle light blue hover effect
    color: "#7AB9C4",           // Slightly darker shade of the text
    borderColor: "#7AB9C4",     // Matches the text color for consistency
  },
};


const buttonStyles = {
  px: 10,
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#FFFFFF",
  backgroundColor: "#8BD3E6",
  border: "1px solid #8BD3E6",
  borderColor: "#8BD3E6",
  "&:hover": {
    backgroundColor: "#6FBCCF", // Slightly darker blue for hover
    color: "#FFFFFF",           // Keeps the text color consistent
    borderColor: "#6FBCCF",     // Matches the background color for cohesion
  },
};



export default function MusicEntryClerkUpload() {
  const [user, setUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:3000/current-user");
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching current user:", error);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const acceptedFileTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    if (file && acceptedFileTypes.includes(file.type)) {
      setSelectedFile(file);
      setUploadMessage("");
    } else {
      setDialogMessage("Please select a valid file (jpg, jpeg, png).");
      setDialogOpen(true);
      setSelectedFile(null);
    }
  };
  

  const handleUpload = () => {
    if (!selectedFile) {
      setDialogMessage("Please select a file first!");
      setDialogOpen(true);
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    fetch("http://localhost:3001/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        setIsUploading(false);
        if (data.filePath) {
          navigate("/clerk-preview", {
            state: { file: data.filePath, fileName: selectedFile.name },
          });
        } else {
          setDialogMessage("Error uploading file. Please try again.");
          setDialogOpen(true);
        }
      })
      .catch((error) => {
        setIsUploading(false);
        setDialogMessage("Error uploading file. Please try again.");
        setDialogOpen(true);
        console.error("Error uploading file:", error);
      });
  };

  return (
    <>
      <GlobalStyle />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <ClerkSidebar active={"upload"} />
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            display: "flex",
            flexDirection: "column",
            marginLeft: "225px",
            minHeight: "100vh" ,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontFamily: "Montserrat",
                fontWeight: "bold",
                mt: 4,
                ml:  1,
              }}
            >
                Digitize Music Scores
              </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="body1"
                sx={{ mr: 2, fontFamily: "Montserrat" }}
              >
                {user ? user.username : "Loading..."}
              </Typography>
              <Avatar
                alt={user?.username}
                src={user && user.profile_picture ? user.profile_picture : null}
              >
                {(!user || !user.profile_picture) &&
                  user?.username.charAt(0).toUpperCase()}
              </Avatar>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} /> {/* This is the line for the divider */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "calc(100% - 64px)",
              mt: -5,
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
                  border: "2px solid #8BD3E6",
                  borderRadius: 8,
                  padding: 4,
                  width: "40%",
                }}
              >
                <img
                  src={ImportIcon}
                  alt="Import Icon"
                  style={{ width: "100px", height: "100px" }}
                />
                <Typography
                  variant="h6"
                  sx={{ mt: 2, fontFamily: "Montserrat" }}
                >
                  Import from computer
                </Typography>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  id="upload-button"
                />
                <label htmlFor="upload-button">
                  <Button
                    variant="outlined"
                    size="large"
                    component="span"
                    sx={{ mt: 5, width: "100%", ...buttonStyles }}
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
                        width: "100%",
                        ...buttonStyles2,
                        '&.Mui-disabled': {
                          backgroundColor: '#D3D3D3', // Grey background for disabled state
                          color: '#A9A9A9', // Optional: lighter grey text for disabled state
                          border: '1px solid #D3D3D3', // Match the disabled border color
                        },
                      }}
                      onClick={handleUpload}
                      disabled={isUploading}
                    >
                      Upload
                    </Button>
                    {isUploading && (
                      <Box sx={{ width: '100%', mt: 2 }}>
                        <LinearProgress
                          sx={{
                            backgroundColor: '#D3D3D3',
                            '& .MuiLinearProgress-bar': { backgroundColor: '#3B3183' },
                          }}
                        />
                      </Box>
                    )}
                    
                  </>
                )}
                {uploadMessage && (
                  <Typography variant="body1" sx={{ mt: 2, color: "red" }}>
                    {uploadMessage}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Dialog for messages */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            padding: "16px",
            fontFamily: "Montserrat",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "Montserrat",
            fontWeight: "bold",
            fontSize: "20px",
            textAlign: "center",
          }}
        >
          Attention
        </DialogTitle>
        <DialogContent
          sx={{
            fontFamily: "Montserrat",
            textAlign: "center",
          }}
        >
          <DialogContentText
            sx={{
              fontFamily: "Montserrat",
              fontSize: "16px",
              color: "#555",
            }}
          >
            {dialogMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            gap: "12px",
            marginTop: "8px",
          }}
        >
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{
              textTransform: "none",
              fontFamily: "Montserrat",
              fontWeight: "bold",
              color: "#3B3183",
              border: "1px solid #3B3183",
              borderRadius: "8px",
              padding: "8px 24px",
              "&:hover": {
                bgcolor: "#ECEFF1",
              },
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
