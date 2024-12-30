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
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ReplyIcon from "@mui/icons-material/Reply";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import AdminSidebar from "./AdminSidebar";
import axios from "axios";

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

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3002/api/feedback/${id}`);
      fetchFeedbackData();
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
      await axios.post(`http://localhost:3002/api/feedback/reply/${selectedFeedback._id}`, {
        reply: replyMessage,
      });
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
            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Montserrat', fontWeight: 'bold', mt: 4, ml:1 }}>
            
              Inbox
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ mr: 2, fontFamily: "Montserrat" }}>
                {currentUser ? currentUser.username : "Admin"}
              </Typography>
              <Avatar>
                {currentUser ? currentUser.username.charAt(0) : "A"}
              </Avatar>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Feedback Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Table>
              <TableHead sx={{ bgcolor: "#8BD3E6" }}>
                <TableRow>
                  <TableCell
                    sx={{ fontFamily: "Montserrat", fontWeight: "bold", color: "#fff" }}
                  >
                    No.
                  </TableCell>
                  <TableCell
                    sx={{ fontFamily: "Montserrat", fontWeight: "bold", color: "#fff" }}
                  >
                    Title
                  </TableCell>
                  <TableCell
                    sx={{ fontFamily: "Montserrat", fontWeight: "bold", color: "#fff" }}
                  >
                    Detail
                  </TableCell>
                  <TableCell
                    sx={{ fontFamily: "Montserrat", fontWeight: "bold", color: "#fff" }}
                  >
                    Attachment
                  </TableCell>
                  <TableCell
                    sx={{ fontFamily: "Montserrat", fontWeight: "bold", color: "#fff" }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {feedbackData.map((row, index) => (
                  <TableRow key={row._id}>
                    <TableCell sx={{ fontFamily: "Montserrat" }}>{index + 1}</TableCell>
                    <TableCell sx={{ fontFamily: "Montserrat" }}>{row.title}</TableCell>
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
                        <Typography color="gray" sx={{ fontFamily: "Montserrat" }}>
                          No attachment
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontFamily: "Montserrat" }}>
                      <IconButton onClick={() => handleReplyOpen(row)}>
                        <ReplyIcon sx={{ color: "#3B3183" }} />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(row._id)}>
                        <DeleteIcon sx={{ color: "#FF5722" }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Reply Dialog */}
          <Dialog open={isReplyDialogOpen} onClose={handleReplyClose}>
            <DialogTitle
              sx={{ fontFamily: "Montserrat", fontWeight: "bold", color: "#3B3183" }}
            >
              Reply to Feedback
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2, fontFamily: "Montserrat" }}>
                {selectedFeedback?.detail}
              </Typography>
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
            </DialogContent>
            <DialogActions>
              <Button onClick={handleReplyClose} sx={{ fontFamily: "Montserrat" }}>
                Cancel
              </Button>
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
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </>
  );
}
