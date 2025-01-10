import React, { useEffect, useState } from "react";
import {
  Box,
  Avatar,
  Divider,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Grid,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ReplyIcon from "@mui/icons-material/Reply";
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
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplyDialogOpen, setReplyDialogOpen] = useState(false);

  const navigate = useNavigate();

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
      await axios.delete(
        `http://localhost:3002/api/feedback/delete/${feedbackIdToDelete}`
      );
      fetchFeedbackData();
      setDeleteDialog(false);
    } catch (error) {
      console.error("There was an error deleting the feedback!", error);
    }
  };
  const handleReplySend = async () => {
    if (!replyMessage.trim()) return;

    try {
      await axios.post(
        `http://localhost:3003/api/feedback/reply/${selectedFeedback._id}`,
        {
          replyMessage, // Send replyMessage as expected by the backend
        }
      );
      setReplyMessage("");
      setReplyDialogOpen(false);
      fetchFeedbackData();
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  const [deleteDialog, setDeleteDialog] = useState(false); // To control the dialog open/close state
  const [feedbackIdToDelete, setFeedbackIdToDelete] = useState(null); // Store the feedback ID to delete

  // Function to open the delete confirmation dialog
  const handleDeleteConfirmation = (id) => {
    setFeedbackIdToDelete(id);
    setDeleteDialog(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialog(false);
  };

  const handleReplyOpen = (feedback) => {
    setSelectedFeedback(feedback);
    setReplyDialogOpen(true);
  };

  const handleReplyClose = () => {
    setReplyDialogOpen(false);
    setReplyMessage("");
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
            marginLeft: "229px",
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
                  <Avatar
                    alt={currentUser.username}
                    src={
                      currentUser && currentUser.profile_picture
                        ? currentUser.profile_picture
                        : null
                    }
                  >
                    {(!currentUser || !currentUser.profile_picture) &&
                      currentUser.username.charAt(0).toUpperCase()}
                  </Avatar>
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
              <Dialog
                open={deleteDialog}
                onClose={handleDeleteCancel}
                sx={{
                  "& .MuiDialog-paper": {
                    borderRadius: "12px", // Add border radius to the dialog
                    fontFamily: "Montserrat", // Apply Montserrat font to the dialog
                  },
                }}
              >
                <DialogTitle
                  sx={{
                    fontFamily: "Montserrat",
                    fontWeight: "bold",
                    color: "#3B3183",
                  }}
                >
                  Delete Feedback
                </DialogTitle>
                <DialogContent sx={{ fontFamily: "Montserrat" }}>
                  Are you sure you want to delete this feedback?
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={handleDeleteCancel}
                    variant="outlined"
                    sx={{
                      fontFamily: "Montserrat",
                      color: "#8BD3E6", // Pastel color text
                      borderColor: "#8BD3E6", // Pastel color border
                      "&:hover": {
                        borderColor: "#8BD3E6", // Hover color for border
                        color: "#8BD3E6", // Hover color for text
                      },
                    }}
                  >
                    No
                  </Button>
                  <Button
                    onClick={handleDelete}
                    variant="contained"
                    color="error"
                    sx={{
                      fontFamily: "Montserrat",
                      backgroundColor: "#E53935", // Red background color
                      color: "#fff", // White text color
                      "&:hover": {
                        backgroundColor: "#D32F2F", // Darker red on hover
                      },
                    }}
                  >
                    Yes
                  </Button>
                </DialogActions>
              </Dialog>

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
                      <TableCell sx={{ color: "#ffffff" }}>Actions</TableCell>
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
                        <TableCell sx={{ fontFamily: "Montserrat" }}>
                          <IconButton onClick={() => handleReplyOpen(row)}>
                            <ReplyIcon sx={{ color: "#3B3183" }} />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteConfirmation(row._id)}
                          >
                            <DeleteIcon sx={{ color: "#FF5722" }} />
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

      <Dialog
        open={isReplyDialogOpen}
        onClose={handleReplyClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex", // Use flexbox
            justifyContent: "center", // Center horizontally
            alignItems: "center", // Center vertically
            fontFamily: "Montserrat",
            fontWeight: "bold",
            color: "#3B3183",
          }}
        >
          {selectedFeedback?.replyMessage &&
          selectedFeedback.replyMessage.trim() !== ""
            ? "Replied Feedback"
            : "Unreplied Feedback"}
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2}>
            {/* Left side of the Dialog */}
            <Grid
              item
              xs={
                selectedFeedback?.attachment_url &&
                selectedFeedback.attachment_url.match(/\.(jpeg|jpg|gif|png)$/i)
                  ? 4 // Left side will take up 4 parts if the image is landscape
                  : 6
              } // Left side will take up 6 parts if the image is portrait
              sx={{ display: "flex", flexDirection: "column" }}
            >
              <Box
                sx={{
                  bgcolor: "grey.200", // Grey background color
                  borderRadius: "8px", // Border radius
                  padding: "16px", // Padding around the text
                  mb:
                    selectedFeedback?.replyMessage &&
                    selectedFeedback.replyMessage.trim() !== ""
                      ? 2
                      : 0,
                  height: "100%",
                }}
              >
                <Typography
                  variant="h6" // Header Typography for "Reply"
                  sx={{
                    color: "#3B3183", // Color for the header
                    fontFamily: "Montserrat",
                    fontWeight: "bold",
                    mb: 1, // Margin below the header
                    textAlign: "center", // Right-align the header
                  }}
                >
                  Feedback
                </Typography>

                <Typography
                  variant="body1" // Body typography for the detail text
                  sx={{
                    fontFamily: "Montserrat",
                    height: "100%", // Set a fixed height (adjust as necessary)
                    overflowY: "auto", // Make it scrollable if the content exceeds the height
                    textAlign: "justify",
                  }}
                >
                  {selectedFeedback?.detail}
                </Typography>
              </Box>

              {/* Show divider and replyMessage if it exists */}
              {selectedFeedback?.replyMessage &&
                selectedFeedback.replyMessage.trim() !== "" && (
                  <>
                    <Divider sx={{ bgcolor: "grey", my: 2 }} />
                    <Box
                      sx={{
                        bgcolor: "#B3E5FC", // Lighter blue background color
                        borderRadius: "8px", // Border radius
                        padding: "16px", // Padding around the text
                        mb: 2, // Margin at the bottom
                      }}
                    >
                      <Typography
                        variant="h6" // Header Typography for "Reply"
                        sx={{
                          color: "#3B3183", // Color for the header
                          fontFamily: "Montserrat",
                          fontWeight: "bold",
                          mb: 1, // Margin below the header
                          textAlign: "right", // Right-align the header
                        }}
                      >
                        Reply
                      </Typography>

                      <Typography
                        variant="body1" // Body typography for the reply message
                        sx={{
                          fontFamily: "Montserrat",
                          height: "175px", // Set a fixed height (adjust as necessary)
                          overflowY: "auto", // Make it scrollable if the content exceeds the height
                          textAlign: "justify", // Justify the text alignment
                        }}
                      >
                        {selectedFeedback?.replyMessage}
                      </Typography>
                    </Box>
                  </>
                )}
            </Grid>

            {/* Right side of the Dialog */}
            <Grid
              item
              xs={
                selectedFeedback?.attachment_url &&
                selectedFeedback.attachment_url.match(/\.(jpeg|jpg|gif|png)$/i)
                  ? 8 // Right side will take up 8 parts if the image is landscape
                  : 6
              } // Right side will take up 6 parts if the image is portrait
              sx={{ display: "flex", flexDirection: "column" }}
            >
              <Typography
                variant="h6" // Header Typography for "Reply"
                sx={{
                  color: "#3B3183", // Color for the header
                  fontFamily: "Montserrat",
                  fontWeight: "bold",
                  mb: 1, // Margin below the header
                  textAlign: "center", // Right-align the header
                }}
              >
                Attachment
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center", // Horizontally center the content
                  justifyContent: "center", // Vertically center the content
                  height: "100%", // Ensure full height for centering
                  border: "1px solid black", // Black border
                  borderRadius: "8px", // Rounded corners (adjust as needed)
                  padding: "10px", // Padding around the content
                }}
              >
                {/* Box for the Image with defined height and width */}
                {selectedFeedback?.attachment_url &&
                  selectedFeedback.attachment_url.trim() !== "" && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center", // Horizontally center the image box
                        alignItems: "center", // Vertically center the image box
                        padding: "10px", // Padding around the image to create space
                        bgcolor: "#E0F7FA", // Lighter background color for the box
                        borderRadius: "8px", // Border radius for the image container
                        width: "100%", // Full width to match the grid
                        height: "auto", // Make the height auto to maintain aspect ratio of image
                        maxHeight: "350px", // Max height for the container box (adjust as needed)
                        maxWidth: "100%", // Max width for the image container
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: "100%", // Ensure the inner box takes up the full width
                          maxHeight: "100%", // Ensure the inner box does not exceed container size
                          overflow: "auto", // Prevent overflow if image is too large
                          textAlign: "center", // Center-align the text
                          alignContent: "center",
                        }}
                      >
                        <img
                          src={selectedFeedback.attachment_url}
                          alt="Attachment"
                          style={{
                            width: "100%", // Make the image take up the full width of the box
                            height: "auto", // Maintain aspect ratio (portrait or landscape)
                            objectFit: "contain", // Scale the image while maintaining its aspect ratio
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                {(!selectedFeedback?.attachment_url ||
                  selectedFeedback.attachment_url.trim() === "") && (
                  <Typography
                    sx={{
                      fontFamily: "Montserrat",
                      color: "#3B3183",
                      marginTop: "20px",
                      textAlign: "center",
                    }}
                  >
                    This Feedback doesn't have any attachment.
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          {/* Cancel Button */}
          <Button
            onClick={handleReplyClose}
            variant="outlined" // Outlined variant for the button
            color="primary" // Use primary color for both outlined and contained styles
            sx={{
              fontFamily: "Montserrat",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#8BD3E6", // Text color
              borderColor: "#8BD3E6", // Border color
              "&:hover": {
                bgcolor: "#fafafa", // Even lighter grey background on hover
                borderColor: "#8BD3E6", // Border color stays #8BD3E6 on hover
              },
            }}
          >
            {selectedFeedback?.replyMessage &&
            selectedFeedback.replyMessage.trim() !== ""
              ? "Close"
              : "Cancel"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
