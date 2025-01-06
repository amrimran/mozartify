import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  List,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  ListItemButton,
  Divider,
  TextField,
  Button,
  Grid,
  IconButton,
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
import UploadIcon from "@mui/icons-material/Upload";
import { Link, useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";
import CustomerSidebar from "./CustomerSidebar";

axios.defaults.withCredentials = true;

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
`;

export default function CustomerAddNewFeedback() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    title: "",
    detail: "",
    attachment: null,
  });
  const [attachmentPreview, setAttachmentPreview] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get("http://localhost:3000/current-user");
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Error fetching current user:", error);
        navigate("/login");
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      setFormData((prevData) => ({
        ...prevData,
        username: currentUser.username,
      }));
    }
  }, [currentUser]);

  const handleReupload = (e) => {
    const file = e.target.files[0];
    setFormData((prevData) => ({ ...prevData, attachment: file }));
    setAttachmentPreview(URL.createObjectURL(file));
  };

  const handleDelete = () => {
    setFormData((prevData) => ({ ...prevData, attachment: null }));
    setAttachmentPreview(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prevData) => ({ ...prevData, attachment: file }));
    setAttachmentPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    const data = new FormData();
    data.append("username", formData.username);
    data.append("title", formData.title);
    data.append("detail", formData.detail);
    data.append("user_id", currentUser._id);
  
    if (formData.attachment) {
      const storageRef = ref(
        storage,
        `feedback_attachments/${Date.now()}_${formData.attachment.name}`
      );
      try {
        await uploadBytes(storageRef, formData.attachment);
        const attachmentUrl = await getDownloadURL(storageRef);
        data.append("attachment_url", String(attachmentUrl));
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }

    if (!(formData.attachment)) {
      try {
        data.append("attachment_url", "");
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  
    try {
      await axios.post("http://localhost:3002/api/feedback", data);
      navigate("/customer-inbox");
    } catch (error) {
      console.error("There was an error submitting the feedback!", error);
    }
  };
  

  const navigationItems = [
    { path: "/customer-homepage", label: "My Dashboard", icon: <Home /> },
    { path: "/customer-library", label: "Libraries", icon: <LibraryBooks /> },
    { path: "/customer-favorites", label: "Favorites", icon: <Favorite /> },
    { path: "/customer-mycart", label: "My Cart", icon: <ShoppingCart /> },
    { path: "/customer-inbox", label: "Inbox", icon: <Feedback /> },
    {
      path: "/customer-profile",
      label: "User Profile",
      icon: <AccountCircle />,
    },
  ];

  return (
    <>
      <GlobalStyle />
      <Box sx={{ display: "flex", height: "100vh" }}>
      <CustomerSidebar />
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h4">Feedback</Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {formData.username}
              </Typography>
              <Avatar>{formData.username[0]}</Avatar>
            </Box>
          </Box>
          <Box>
            <Divider />
            <Box sx={{ mt: 2, p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Username"
                    name="username"
                    variant="outlined"
                    value={formData.username}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Title"
                    name="title"
                    variant="outlined"
                    value={formData.title}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={4}
                    label="Detail"
                    name="detail"
                    variant="outlined"
                    value={formData.detail}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      border: "1px dashed grey",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: attachmentPreview? "50%": "100%",
                      p: 2,
                    }}
                  >
                    {attachmentPreview ? (
                      <Box sx={{ mt: 2 }}>
                        <img
                          src={attachmentPreview}
                          alt="Attachment Preview"
                          style={{ maxWidth: "100%", maxHeight: "200px" }}
                        />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                          p: 2,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ mr: 2 }}
                        >
                          Attachment (if any)
                        </Typography>
                        <IconButton component="label">
                          <UploadIcon />
                          <input
                            type="file"
                            hidden
                            onChange={handleFileChange}
                          />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                  {attachmentPreview && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        mt: 2,
                      }}
                    >
                      <Button
                        variant="contained"
                        color="secondary"
                        component="label"
                        sx={{ mr: 2 }}
                      >
                        Reupload
                        <input type="file" hidden onChange={handleReupload} />
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={handleDelete}
                      >
                        Delete
                      </Button>
                    </Box>
                  )}
                  <Box
                    sx={{ mt: 5, display: "flex", justifyContent: "center" }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmit}
                    >
                      Send Feedback
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
