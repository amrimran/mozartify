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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import { Close } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";
import CustomerSidebar from "./CustomerSidebar";
const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL_2 = import.meta.env.VITE_API_URL_2;

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/current-user`);
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
    if (!formData.title || !formData.detail) {
      setIsDialogOpen(true);
      return;
    }

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
    } else {
      data.append("attachment_url", "");
    }

    try {
      await axios.post(`${API_BASE_URL_2}/api/feedback`, data);
      navigate("/customer-inbox");
    } catch (error) {
      console.error("There was an error submitting the feedback!", error);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <GlobalStyle />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <CustomerSidebar active="inbox" />
        <Box sx={{ flexGrow: 1, p: 3, marginLeft: "229px" }}>
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
                      height: attachmentPreview ? "50%" : "100%",
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

      <Dialog
        open={isDialogOpen}
        onClose={closeDialog}
        maxWidth="xs"
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "16px", // Add border radius to the Dialog
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#ffcccc",
            color: "red",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Attention
          <IconButton edge="end" onClick={closeDialog}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100px", // Adjust height as needed
          }}
        >
          <Typography variant="body1" align="center">
            Required fields are not filled.
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
}
