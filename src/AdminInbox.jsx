import DeleteIcon from "@mui/icons-material/Delete";
import ReplyIcon from "@mui/icons-material/Reply";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import AdminSidebar from "./AdminSidebar";

axios.defaults.withCredentials = true;

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
`;

export default function AdminInbox() {
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
    try {
      const response = await axios.get(`http://localhost:3002/api/feedback`);
      setFeedbackData(response.data);
    } catch (error) {
      console.error("Error fetching feedback data:", error);
    }
  };

  useEffect(() => {
    fetchFeedbackData();
  }, []);

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

  const handleReplyOpen = (feedback) => {
    setSelectedFeedback(feedback);
    setReplyDialogOpen(true);
  };

  const handleReplyClose = () => {
    setReplyDialogOpen(false);
    setReplyMessage("");
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

  return (
    <>
      <GlobalStyle />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <AdminSidebar active="inbox" />
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            marginLeft: "225px",
            minHeight: "100vh",
            bgcolor: "#FFFFFF", // Light background
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              mt: 2,
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontFamily: "Montserrat",
                fontWeight: "bold",
                mt: 4,
                ml: 1,
              }}
            >
              Inbox
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="body1"
                sx={{ mr: 2, fontFamily: "Montserrat" }}
              >
                {currentUser ? currentUser.username : "Admin"}
              </Typography>
              <Avatar
                alt={currentUser ? currentUser.username : null}
                src={currentUser && currentUser.profile_picture ? currentUser.profile_picture : null}
              >
                {(!currentUser || !currentUser.profile_picture) && currentUser
                  ? currentUser.username.charAt(0).toUpperCase()
                  : null}
              </Avatar>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

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

          {/* Feedback Table */}
          <TableContainer
            component={Paper}
            sx={{ borderRadius: 2, overflow: "hidden" }}
          >
            <Table>
              <TableHead sx={{ bgcolor: "#8BD3E6" }}>
                <TableRow>
                  <TableCell
                    sx={{
                      fontFamily: "Montserrat",
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    No.
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: "Montserrat",
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    Title
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: "Montserrat",
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    Detail
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: "Montserrat",
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    Attachment
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: "Montserrat",
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {feedbackData.map((row, index) => (
                  <TableRow key={row._id}>
                    <TableCell sx={{ fontFamily: "Montserrat" }}>
                      {index + 1}
                    </TableCell>
                    <TableCell sx={{ fontFamily: "Montserrat" }}>
                      {row.title}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: "Montserrat",
                        maxWidth: "250px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.detail}
                    </TableCell>
                    <TableCell sx={{ fontFamily: "Montserrat" }}>
                      {row.attachment_url ? (
                        <a
                          href={row.attachment_url}
                          style={{ color: "#3B3183" }}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Attachment
                        </a>
                      ) : (
                        <Typography
                          color="gray"
                          sx={{ fontFamily: "Montserrat" }}
                        >
                          No attachment
                        </Typography>
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

          {/* Reply Dialog */}
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
                : "Reply to Feedback"}
            </DialogTitle>

            <DialogContent>
              <Grid container spacing={2}>
                {/* Left side of the Dialog */}
                <Grid
                  item
                  xs={
                    selectedFeedback?.attachment_url &&
                    selectedFeedback.attachment_url.match(
                      /\.(jpeg|jpg|gif|png)$/i
                    )
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
                      mb: 2, // Margin at the bottom
                    }}
                  >
                    <Typography
                      variant="h6" // Header Typography for "Feedback"
                      sx={{
                        color: "#3B3183", // Color for the header
                        fontFamily: "Montserrat",
                        fontWeight: "bold",
                        mb: 1, // Margin below the header
                      }}
                    >
                      Feedback
                    </Typography>

                    <Typography
                      variant="body1" // Body typography for the detail text
                      sx={{
                        fontFamily: "Montserrat",
                        height: "175px", // Set a fixed height (adjust as necessary)
                        overflowY: "auto", // Make it scrollable if the content exceeds the height
                        textAlign: "justify",
                      }}
                    >
                      {selectedFeedback?.detail}
                    </Typography>
                  </Box>

                  {/* Conditionally render TextField if replyMessage is empty */}
                  {!(
                    selectedFeedback &&
                    selectedFeedback.replyMessage &&
                    selectedFeedback.replyMessage.trim() !== ""
                  ) && (
                    <TextField
                      multiline
                      rows={4}
                      fullWidth
                      variant="outlined"
                      placeholder="Type your reply here..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      sx={{ fontFamily: "Montserrat" }}
                    />
                  )}

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
                    selectedFeedback.attachment_url.match(
                      /\.(jpeg|jpg|gif|png)$/i
                    )
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
                    {selectedFeedback?.attachment_url && (
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
                          }}
                        >
                          {selectedFeedback?.attachment_url &&
                          selectedFeedback.attachment_url.trim() !== "" ? (
                            <img
                              src={selectedFeedback?.attachment_url}
                              alt="Attachment"
                              style={{
                                width: "100%", // Make the image take up the full width of the box
                                height: "auto", // Maintain aspect ratio (portrait or landscape)
                                objectFit: "contain", // Scale the image while maintaining its aspect ratio
                              }}
                            />
                          ) : (
                            <Typography
                              variant="body1"
                              sx={{
                                fontFamily: "Montserrat",
                                color: "#3B3183",
                                fontWeight: "bold",
                                marginTop: "20px",
                                textAlign: "center",
                              }}
                            >
                              This Feedback doesn't have any attachment.
                            </Typography>
                          )}
                        </Box>
                      </Box>
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

              {/* Send Reply Button */}
              {!(
                selectedFeedback?.replyMessage &&
                selectedFeedback.replyMessage.trim() !== ""
              ) && (
                <Button
                  variant="contained"
                  onClick={handleReplySend}
                  disabled={!replyMessage.trim()}
                  sx={{
                    bgcolor: "#8BD3E6",
                    color: "#fff",
                    fontFamily: "Montserrat",
                    "&:hover": {
                      bgcolor: "#67ADC1",
                    },
                  }}
                >
                  Send Reply
                </Button>
              )}
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </>
  );
}
