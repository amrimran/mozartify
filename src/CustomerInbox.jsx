import React, { useEffect, useState } from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
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
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from "@mui/icons-material/Add";
import { Link, useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import SidebarMozartifyLogo from "./assets/mozartify.png";
import { styled } from "@mui/material/styles";
import axios from "axios";
import ScrollableCell from "./ScrollableCell";
axios.defaults.withCredentials = true;

const CustomAddIcon = styled(AddIcon)(({ theme }) => ({
  backgroundColor: "#c44131",
  color: "white",
  borderRadius: "50%",
  padding: theme.spacing(0.5),
}));

const GlobalStyle = createGlobalStyle`
body {
  margin: 0;
  padding: 0;
  font-family: 'Montserrat', sans-serif;
}
`;

export default function CustomerInbox() {
  const [feedbackData, setFeedbackData] = useState([]);

  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

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

  const fetchFeedbackData = async () => {
    axios
    .get(`http://localhost:3002/api/feedback`)
    .then((response) => {
      const userFeedbacks = response.data.filter(
        (feedback) => feedback.user_id === currentUser._id
      );
      if (userFeedbacks.length === 0) {
        console.log("No feedback data found for the current user.");
      } else {
        setFeedbackData(userFeedbacks);
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
  };

  useEffect(() => {
    if (currentUser) {
      fetchFeedbackData();      
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3000/logout");
      setCurrentUser(null);
      if ("caches" in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name);
          });
        });
      }
      window.history.pushState(null, null, window.location.href);
      window.history.pushState(null, null, window.location.href);
      window.history.go(-2);

      window.onpopstate = function () {
        window.history.go(1);
      };

      navigate("/login", { replace: true }); // Redirect to login page after logout
    } catch (error) {
      console.error("Error during logout:", error);
      alert("An error occurred during logout. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3002/api/feedback/${id}`);
      fetchFeedbackData();
    } catch (error) {
      console.error("There was an error deleting the feedback!", error);
    }
  };

  const navigationItems = [
    { path: "/customer-homepage", label: "My Dashboard", icon: <Home /> },
    { path: "/customer-library", label: "Libraries", icon: <LibraryBooks /> },
    { path: "/customer-favourites", label: "Favourites", icon: <Favorite /> },
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
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
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
            <Typography variant="h4">Inbox</Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {currentUser ? (
                <>
                  <Typography variant="body1" sx={{ mr: 2 }}>
                    {currentUser.username}
                  </Typography>
                  <Avatar>{currentUser.username.charAt(0)}</Avatar>
                </>
              ) : (
                <>
                  <Typography variant="body1" sx={{ mr: 2 }}>
                    Loading...
                  </Typography>
                  <Avatar></Avatar>
                </>
              )}
            </Box>
          </Box>

          <Box>
            <Divider />

            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={() =>
                  navigate(`/customer-inbox/customer-add-new-feedback`)
                }
                sx={{
                  backgroundColor: "#F4F7FE",
                  color: "#000",
                  "&:hover": {
                    backgroundColor: "#E0E5F2",
                  },
                  fontFamily: "Montserrat, sans-serif",
                  textTransform: "none",
                }}
                startIcon={<CustomAddIcon />}
              >
                Add New Feedback
              </Button>
            </Box>
            <Box sx={{ mt: 2 }}>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead
                    sx={{ color: "black", backgroundColor: "#E4DCC8" }}
                  >
                    <TableRow>
                      <TableCell>No.</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Detail</TableCell>
                      <TableCell>Attachment</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {feedbackData.map((row, index) => (
                      <TableRow key={row._id}>
                        <TableCell component="th" scope="row">
                          {index + 1}
                        </TableCell>
                        <TableCell>{row.title}</TableCell>
                        <ScrollableCell content={row.detail} />
                        <TableCell>
                          {row.attachment_url ? (
                            <a
                              href={row.attachment_url}
                              style={{ color: "red" }}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Attachment
                            </a>
                          ) : (
                            <span style={{ color: "grey" }}>No attachment</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            aria-label="delete"
                            onClick={() => handleDelete(row._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
