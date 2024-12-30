import React, { useEffect, useState } from "react";
import {
  Box,
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
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import { styled } from "@mui/material/styles";
import axios from "axios";
import ScrollableCell from "./ScrollableCell";
import CustomerSidebar from "./CustomerSidebar";

axios.defaults.withCredentials = true;

const CustomAddIcon = styled(AddIcon)(({ theme }) => ({
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

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3002/api/feedback/${id}`);
      fetchFeedbackData();
    } catch (error) {
      console.error("There was an error deleting the feedback!", error);
    }
  };

  return (
    <>
      <GlobalStyle />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <CustomerSidebar />
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            padding: 5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              mt: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="h4">Inbox</Typography>
            </Box>

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

            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={() =>
                  navigate(`/customer-inbox/customer-add-new-feedback`)
                }
                sx={{
                  backgroundColor: "#67ADC1", // Base background color
                  color: "#fff", // White text color
                  fontFamily: "Montserrat, sans-serif",
                  textTransform: "none",
                  padding: 0,
                  "&:hover": {
                    backgroundColor: "#FFEE8C",
                    color: "#000000",
                    "& .icon-box": {
                      backgroundColor: "#67ADC1", // Change the box to the button's color
                    },
                    "& .MuiSvgIcon-root": {
                      color: "#ffffff", // Change icon color to black on hover
                    },
                  },
                }}
              >
                <Box
                  className="icon-box"
                  sx={{
                    backgroundColor: "#FFEE8C", // Initial color of the box
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "40px",
                    "&:hover": {
                      backgroundColor: "#67ADC1", // Change to the button's color on hover
                    },
                    borderRadius: 1,
                  }}
                >
                  <CustomAddIcon sx={{ color: "#000" }} />{" "}
                </Box>

                <Box sx={{ paddingLeft: "10px", paddingRight: "16px" }}>
                  Add New Feedback
                </Box>
              </Button>
            </Box>
            <Box sx={{ mt: 2 }}>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead
                    sx={{ color: "black", backgroundColor: "#67ADC1" }}
                  >
                    <TableRow>
                      <TableCell sx={{ color: "#ffffff" }}>No.</TableCell>
                      <TableCell sx={{ color: "#ffffff" }}>Title</TableCell>
                      <TableCell sx={{ color: "#ffffff" }}>Detail</TableCell>
                      <TableCell sx={{ color: "#ffffff" }}>
                        Attachment
                      </TableCell>
                      <TableCell sx={{ color: "#ffffff" }}></TableCell>
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
