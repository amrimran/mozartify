import React, { useState } from "react";
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
import HomeIcon from "@mui/icons-material/Home";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FeedbackIcon from "@mui/icons-material/Feedback";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import UploadIcon from "@mui/icons-material/Upload";
import { Link } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import SidebarMozartifyLogo from "./assets/mozartify.png";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
`;

export default function CustomerAddNewFeedback() {
  const [formData, setFormData] = useState({
    username: "Nifail Amsyar",
    title: "",
    detail: "",
    attachment: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prevData) => ({ ...prevData, attachment: e.target.files[0] }));
  };

  const handleSubmit = async () => {
    console.log("Form Data:", formData); // Log formData
    const data = new FormData();
    data.append("username", formData.username);
    data.append("title", formData.title);
    data.append("detail", formData.detail);
    if (formData.attachment) {
      data.append("attachment", formData.attachment, formData.attachment.name);
    }
  
    try {
      const response = await axios.post("http://localhost:3003/api/feedback", data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });    
      console.log("Feedback submitted:", response.data);
    } catch (error) {
      console.error("There was an error submitting the feedback!", error);
    }
  };
  

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
                      height: "100%",
                      p: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      align="center"
                      sx={{ mr: 2 }}
                    >
                      Attachment (if any)
                    </Typography>
                    <IconButton component="label">
                      <UploadIcon />
                      <input type="file" hidden onChange={handleFileChange} />
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ mt: 5, display: "flex", justifyContent: "center" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                >
                  Send Feedback
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
