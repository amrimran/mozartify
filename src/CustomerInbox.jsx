import React, { useEffect, useState, useRef } from "react";
import {
  Box,
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  TablePagination,
  Skeleton,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import AddIcon from "@mui/icons-material/Add";

import { useNavigate } from "react-router-dom";
import axios from "axios";
import CustomerSidebar from "./CustomerSidebar";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const CustomerInbox = () => {
  const [feedbackData, setFeedbackData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [newReply, setNewReply] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isNewFeedbackOpen, setIsNewFeedbackOpen] = useState(false);

  // New Feedback Form States
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [page, setPage] = useState(0); // Current page (zero-indexed)
  const [rowsPerPage, setRowsPerPage] = useState(5); // Number of rows per page
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });


  const drawerRef = useRef(null);

  const chatContainerRef = useRef(null);

  // Configure axios with credentials
  axios.defaults.withCredentials = true;

  const uploadImageToFirebase = async (file) => {
    const storage = getStorage();
    const timestamp = Date.now();
    const fileName = `feedback_attachments/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success",
    reload: false,
  });

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const showNotification = (message, type = "success", reload = false) => {
    setSnackbar({
      open: true,
      message,
      type,
      reload,
    });
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };
  
  const sortedFeedbackData = [...feedbackData].sort((a, b) => {
    if (sortConfig.key) {
      const valueA = sortConfig.key === "date"
        ? new Date(
            a.replies?.length > 0
              ? a.replies[a.replies.length - 1].date
              : a.feedbackDate
          )
        : a[sortConfig.key];
      const valueB = sortConfig.key === "date"
        ? new Date(
            b.replies?.length > 0
              ? b.replies[b.replies.length - 1].date
              : b.feedbackDate
          )
        : b[sortConfig.key];
  
      if (valueA < valueB) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
    }
    return 0;
  });
  

  const TableRowSkeleton = () => (
    <TableRow
      sx={{
        opacity: isLoading ? 1 : 0,
        transition: "opacity 0.3s ease-in-out",
      }}
    >
      {/* Title column */}
      <TableCell>
        <Skeleton
          animation="pulse"
          height={24}
          width="70%"
          sx={{
            transform: "scale(1, 0.8)",
            backgroundColor: "#f5f5f5",
            "&::after": {
              background:
                "linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.04), transparent)",
            },
          }}
        />
      </TableCell>

      {/* Last Updated column */}
      <TableCell>
        <Skeleton
          animation="pulse"
          height={24}
          width="40%"
          sx={{
            transform: "scale(1, 0.8)",
            backgroundColor: "#f5f5f5",
            "&::after": {
              background:
                "linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.04), transparent)",
            },
          }}
        />
      </TableCell>

      {/* Status column */}
      <TableCell>
        <Skeleton
          animation="pulse"
          height={24}
          width="30%"
          sx={{
            transform: "scale(1, 0.8)",
            backgroundColor: "#f5f5f5",
            "&::after": {
              background:
                "linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.04), transparent)",
            },
          }}
        />
      </TableCell>

      {/* Actions column */}
      <TableCell>
        <Box sx={{ display: "flex", gap: 1 }}>
          {/* Chat and Delete icon skeletons */}
          {[1, 2].map((index) => (
            <Skeleton
              key={index}
              animation="pulse"
              variant="circular"
              width={30}
              height={30}
              sx={{
                backgroundColor: "#f5f5f5",
                "&::after": {
                  background:
                    "linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.04), transparent)",
                },
              }}
            />
          ))}
        </Box>
      </TableCell>
    </TableRow>
  );

  const TableHeadSkeleton = () => (
    <TableHead sx={{ bgcolor: "#8BD3E6" }}>
      <TableRow>
        {["Title", "Last Updated", "Status", "Actions"].map((header, index) => (
          <TableCell
            key={index} // Use index as the key since `header` is unused now
            sx={{
              position: "relative",
              color: "white",
              fontFamily: "'Montserrat', sans-serif",
              textTransform: "uppercase",
              fontWeight: "bold",
              fontSize: "14px",
              padding: "16px",
              borderBottom: "1px solid #8BD3E6",
              overflow: "hidden",
            }}
          >
            <Skeleton
              animation="wave"
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                "&::after": {
                  background:
                    "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                },
              }}
            />
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        // 5MB limit
        setError("Image size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
        setImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const paginatedFeedbackData = feedbackData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };

  // Update the handleSubmitFeedback function to show notifications
  const handleSubmitFeedback = async () => {
    if (!title.trim() || !detail.trim()) {
      showNotification("Title and detail are required", "error");
      return;
    }

    try {
      let attachmentUrl = null;
      if (image) {
        attachmentUrl = await uploadImageToFirebase(image);
      }

      const feedbackData = {
        title,
        detail,
        user_id: currentUser?._id,
        username: currentUser?.username,
        status: "pending", // Default status is pending
        attachment_url: attachmentUrl,
      };

      const response = await axios.post(
        "http://localhost:3002/api/feedback",
        feedbackData
      );

      setFeedbackData((prev) => [...prev, response.data]);
      setIsNewFeedbackOpen(false);
      // Reset form
      setTitle("");
      setDetail("");
      setImage(null);
      setPreviewUrl("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setError("Failed to submit feedback");
    }
  };

  const getStatusDisplay = (feedback) => {
    return feedback.status || "pending"; // Default to "pending" if status is not set
  };

  const buttonStyles = {
    px: 2,
    fontFamily: "Montserrat",
    fontWeight: "bold",
    color: "#FFFFFF",
    backgroundColor: "#8BD3E6",
    border: "1px solid #8BD3E6",
    borderColor: "#8BD3E6",
    boxShadow: "none", // Correct spelling
    "&:hover": {
      backgroundColor: "#6FBCCF", // Slightly darker blue for hover
      color: "#FFFFFF", // Keeps the text color consistent
      borderColor: "#6FBCCF",
      boxShadow: "none", // Ensures no shadow on hover
    },
    "&:disabled": {
      backgroundColor: "#E0E0E0",
      borderColor: "#E0E0E0",
      color: "#9E9E9E",
    },
  };

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
    if (!currentUser?._id) return;

    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3002/api/feedback?userId=${currentUser._id}`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setFeedbackData(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load feedback messages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchFeedbackData();
    }
  }, [currentUser]);

  // Update the handleDelete function to show notifications
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3002/api/feedback/delete/${id}`);
      setFeedbackData((prev) => prev.filter((feedback) => feedback._id !== id));
      showNotification("Feedback deleted successfully");
    } catch (error) {
      console.error("Error deleting feedback:", error);
      showNotification("Failed to delete feedback", "error");
    }
  };

  const handleOpenChat = (feedback) => {
    setSelectedFeedback(feedback);
    const messages = [
      {
        type: "feedback",
        content: feedback.detail,
        date: feedback.feedbackDate,
        attachment: feedback.attachment_url,
        sender: "customer",
      },
      ...(feedback.replies || []).map((reply) => ({
        type: "reply",
        content: reply.message,
        date: reply.date,
        sender: reply.sender || "admin",
      })),
    ];

    setChatMessages(messages);
    setDrawerOpen(true);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        drawerOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(event.target)
      ) {
        setDrawerOpen(false); // Close the drawer
      }
    };

    // Attach the event listener when the drawer is open
    if (drawerOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    // Cleanup the event listener
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Update the handleSendReply function to show notifications
  const handleSendReply = async () => {
    if (!newReply.trim() || !selectedFeedback) return;

    try {
      const response = await axios.post(
        `http://localhost:3002/api/feedback/reply/${selectedFeedback._id}`,
        {
          message: newReply,
        }
      );

      const newMessage = {
        type: "reply",
        content: newReply,
        date: new Date(),
        sender: "customer",
      };

      setChatMessages((prev) => [...prev, newMessage]);
      setNewReply("");

      setFeedbackData((prev) =>
        prev.map((feedback) =>
          feedback._id === selectedFeedback._id ? response.data : feedback
        )
      );
      showNotification("Reply sent successfully");
    } catch (error) {
      console.error("Error sending reply:", error);
      showNotification(
        error.response?.data?.message || "Failed to send reply",
        "error"
      );
    }
  };

  const isSenderMessage = (message) => {
    return message.sender === "customer";
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <CustomerSidebar active="inbox" />

      <Box
        sx={{
          flexGrow: 1,
          p: 3,
          ml: "240px",
          opacity: isLoading ? 0.9 : 1,
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        {" "}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            mt: 3,
          }}
        >
          <Typography
            variant="h4"
            sx={{ fontFamily: "Montserrat", fontWeight: "bold" }}
          >
            Inbox
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            {isLoading ? (
              <>
                <Skeleton
                  animation="wave"
                  width={100}
                  height={24}
                  sx={{ mr: 2 }}
                />
                <Skeleton
                  animation="wave"
                  variant="circular"
                  width={40}
                  height={40}
                />
              </>
            ) : (
              <>
                <Typography
                  variant="body1"
                  sx={{ mr: 2, fontFamily: "Montserrat" }}
                >
                  {currentUser ? currentUser.username : "Admin"}
                </Typography>
                <Avatar
                  alt={currentUser ? currentUser.username : null}
                  src={
                    currentUser && currentUser.profile_picture
                      ? currentUser.profile_picture
                      : null
                  }
                >
                  {(!currentUser || !currentUser.profile_picture) && currentUser
                    ? currentUser.username.charAt(0).toUpperCase()
                    : null}
                </Avatar>
              </>
            )}
          </Box>
        </Box>
        <Divider sx={{ my: 1, mb: 4 }} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            mb: 3,
            mt: 3,
          }}
        >
          <Button
            variant="contained"
            onClick={() => setIsNewFeedbackOpen(true)}
            sx={buttonStyles}
            startIcon={<AddIcon />} // Add the plus icon
          >
            Add New Feedback
          </Button>
        </Box>
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: 1,
            borderRadius: 2,
            overflow: "hidden",
            "& .MuiTable-root": {
              tableLayout: "fixed", // Force table to have fixed layout
            },
          }}
        >
          <Table>
            {/* Table Head */}
            {isLoading ? (
              <TableHeadSkeleton />
            ) : (
              <TableHead sx={{ bgcolor: "#8BD3E6" }}>
  <TableRow>
    {[
      { label: "Title", key: "title" },
      { label: "Last Updated", key: "date" },
      { label: "Status", key: "status" },
      { label: "Actions", key: null },
    ].map((header, index) => (
      <TableCell
        key={index}
        onClick={() => header.key && handleSort(header.key)}
        sx={{
          color: "white",
          fontFamily: "'Montserrat', sans-serif",
          textTransform: "uppercase",
          fontWeight: "bold",
          fontSize: "14px",
          padding: "16px",
          borderBottom: "1px solid #8BD3E6",
          cursor: header.key ? "pointer" : "default",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {header.label}
          {header.key && (
            <Typography
              component="span"
              sx={{
                fontSize: "12px",
                color: sortConfig.key === header.key ? "white" : "rgba(255, 255, 255, 0.7)",
                fontWeight: sortConfig.key === header.key ? "bold" : "normal",
              }}
            >
              {sortConfig.key === header.key
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : "▲ ▼"}
            </Typography>
          )}
        </Box>
      </TableCell>
    ))}
  </TableRow>
</TableHead>

            )}

            {/* Table Body */}
            <TableBody>
  {isLoading
    ? [...Array(rowsPerPage)].map((_, index) => <TableRowSkeleton key={index} />)
    : sortedFeedbackData
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((row) => (
                    <TableRow
                      key={row._id}
                      sx={{
                        opacity: 0,
                        animation: "fadeIn 0.3s ease-in-out forwards",
                        "@keyframes fadeIn": {
                          "0%": {
                            opacity: 0,
                            transform: "translateY(10px)",
                          },
                          "100%": {
                            opacity: 1,
                            transform: "translateY(0)",
                          },
                        },
                      }}
                    >
                       <TableCell
                                                sx={{
                                                  fontFamily: "'Montserrat', sans-serif",
                                                  fontSize: "14px",
                                                  padding: "16px",
                                                  color: "#333",
                                                  maxWidth: "100px", // Limit width to trigger ellipsis
                                                  whiteSpace: "nowrap", // Prevent wrapping
                                                  overflow: "hidden", // Hide overflowing text
                                                  textOverflow: "ellipsis", // Add ellipsis for overflowing text
                                                }}
                                              >
                                                <Tooltip
                                                  title={row.title || ""}
                                                  arrow
                                                  componentsProps={{
                                                    tooltip: {
                                                      sx: {
                                                        fontFamily: "'Montserrat', sans-serif", // Set Montserrat font
                                                        fontSize: "14px", // Ensure consistent font size
                                                        padding: "8px 12px", // Add padding for better appearance
                                                        borderRadius: "4px", // Optional: Rounded edges for better look
                                                        bgcolor: "rgba(128, 128, 128, 1)", // Grey background
                                                        color: "#fff", // White text color
                                                      },
                                                    },
                                                  }}
                                                >
                                                  <span>{row.title}</span>
                                                </Tooltip>
                                              </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: "14px",
                          padding: "16px",
                          color: "#666",
                        }}
                      >
                        {new Date(
                          row.replies?.length > 0
                            ? row.replies[row.replies.length - 1].date
                            : row.feedbackDate
                        ).toLocaleDateString("en-GB")}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: "14px",
                          textTransform: "capitalize",
                          padding: "16px",
                          color:
                            row.status === "resolved" ? "#28A745" : "#FFB400",
                          fontWeight: "bold",
                        }}
                      >
                        {getStatusDisplay(row)}
                      </TableCell>
                      <TableCell
                        sx={{
                          padding: "16px",
                          display: "flex",
                          gap: "8px",
                        }}
                      >
                        <IconButton
                          onClick={() => handleOpenChat(row)}
                          sx={{
                            color: "#8BD3E6",
                            padding: "6px",
                            borderRadius: "8px",
                            ":hover": {
                              bgcolor: "transparent", // Prevents the background from appearing on hover
                            },
                          }}
                        >
                          <ChatIcon sx={{ fontSize: "20px" }} />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(row._id)}
                          sx={{
                            color: "#DB2226",
                            ":hover": {
                              bgcolor: "transparent", // Prevents the background from appearing on hover
                            },
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: "20px" }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={feedbackData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              "& .MuiTablePagination-root": {
                fontFamily: "'Montserrat', sans-serif",
              },
              "& .MuiTablePagination-selectLabel": {
                fontFamily: "'Montserrat', sans-serif",
              },
              "& .MuiTablePagination-select": {
                fontFamily: "'Montserrat', sans-serif",
              },
              "& .MuiTablePagination-selectIcon": {
                fontFamily: "'Montserrat', sans-serif",
              },
              "& .MuiTablePagination-displayedRows": {
                fontFamily: "'Montserrat', sans-serif",
              },
              "& .MuiTablePagination-menuItem": {
                fontFamily: "'Montserrat', sans-serif",
              },
              "& .MuiTablePagination-actions": {
                fontFamily: "'Montserrat', sans-serif",
              },
            }}
          />
        </TableContainer>
      </Box>

      <Box
        ref={drawerRef}
        sx={{
          position: "fixed",
          right: drawerOpen ? 0 : "-400px",
          top: 0,
          width: "400px",
          height: "100vh",
          bgcolor: "white",
          boxShadow: "-4px 0 12px rgba(0, 0, 0, 0.15)",
          transition: "right 0.3s ease",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            p: 2,
            bgcolor: "#8BD3E6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "white",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: "bold",
              fontSize: "18px",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {selectedFeedback?.title}
          </Typography>
          <IconButton
            onClick={() => setDrawerOpen(false)}
            sx={{
              color: "white",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Chat Messages */}
        <Box
          ref={chatContainerRef}
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            p: 2,
            bgcolor: "#F8FAFC",
          }}
        >
          {chatMessages.map((message, index) => (
            <Box
              key={index}
              sx={{
                mb: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: isSenderMessage(message)
                  ? "flex-end"
                  : "flex-start",
              }}
            >
              <Box
                sx={{
                  maxWidth: "80%",
                  p: 2,
                  borderRadius: 2,
                  bgcolor: isSenderMessage(message) ? "#8BD3E6" : "#FFFFFF",
                  color: isSenderMessage(message) ? "white" : "black",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "14px",
                  }}
                >
                  {message.content}
                </Typography>
                {message.attachment && (
                  <Box sx={{ mt: 1 }}>
                    <img
                      src={message.attachment}
                      alt="Attachment"
                      style={{
                        maxWidth: "100%",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    />
                  </Box>
                )}
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 1,
                    opacity: 0.7,
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  {new Date(message.date).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Reply Box */}
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid #E0E0E0",
            bgcolor: "#FFFFFF",
          }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your reply..."
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              size="small"
              multiline // Allows the text field to grow vertically for long content
              maxRows={4} // Limit the number of rows it can grow to
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendReply();
                }
              }}
              sx={{
                bgcolor: "#F8FAFC",
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "14px",
                "& .MuiOutlinedInput-root": {
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "14px",
                },
                "& .MuiOutlinedInput-input": {
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "14px",
                  lineHeight: "1.5",
                },
                "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: "#8BD3E6", // Change border on hover
                  },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: "#8BD3E6", // Keep border consistent on focus
                  },
              }}
              InputProps={{
                sx: {
                  "&::placeholder": {
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "14px",
                  },
                },
              }}
            />

            <IconButton
              onClick={handleSendReply}
              sx={{
                color: "#8BD3E6",
                "&:hover": {
                  bgcolor: "transparent", // Prevents the background from appearing on hover
                  color: "#6FBCCF",
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Dialog
        open={isNewFeedbackOpen}
        onClose={() => setIsNewFeedbackOpen(false)}
        maxWidth="sm"
        fullWidth
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
            bgcolor: "#67ADC1",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "Montserrat",
            fontWeight: "bold",
            fontSize: "20px",
            textAlign: "center",
            borderRadius: 2,
          }}
        >
          New Feedback
          <IconButton
            onClick={() => setIsNewFeedbackOpen(false)}
            sx={{ color: "white" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            mt: 2,
            fontFamily: "Montserrat",
            textAlign: "center",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {error && (
              <Typography
                color="error"
                sx={{ mb: 2, fontFamily: "Montserrat" }}
              >
                {error}
              </Typography>
            )}
            <TextField
  label="Title"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  fullWidth
  required
  variant="outlined"
  inputProps={{
    maxLength: 50, // Limit input to 50 characters
  }}
  sx={{
    fontFamily: "Montserrat",
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#8BD3E6", // Default border color
      },
      "&:hover fieldset": {
        borderColor: "#6FBCCF", // Darker blue on hover
      },
      "&.Mui-focused fieldset": {
        borderColor: "#8BD3E6", // Keep blue on focus
      },
    },
    "& .MuiInputLabel-root": {
      fontFamily: "Montserrat",
    },
    "& .MuiOutlinedInput-input": {
      fontFamily: "Montserrat",
    },
  }}
/>


            <TextField
              label="Detail"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              fullWidth
              required
              multiline
              rows={4}
              variant="outlined"
              sx={{
                fontFamily: "Montserrat",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#8BD3E6", // Default border color
                  },
                  "&:hover fieldset": {
                    borderColor: "#6FBCCF", // Darker blue on hover
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#8BD3E6", // Keep blue on focus
                  },
                },
                "& .MuiInputLabel-root": {
                  fontFamily: "Montserrat",
                },
                "& .MuiOutlinedInput-input": {
                  fontFamily: "Montserrat",
                },
              }}
            />

            <Box sx={{ mt: 2 }}>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                id="image-upload"
                onChange={handleImageChange}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<ImageIcon />}
                  sx={{
                    color: "#67ADC1",
                    borderColor: "#67ADC1",
                    fontFamily: "Montserrat",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    ":hover": {
                      borderColor: "#67ADC1",
                    },
                  }}
                >
                  Attach Image
                </Button>
              </label>
            </Box>

            {previewUrl && (
              <Box sx={{ position: "relative", mt: 2 }}>
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    maxWidth: "100%",
                    borderRadius: "4px",
                    border: "1px solid #ddd", // Thin border added
                  }}
                />
                <IconButton
                  onClick={() => {
                    setImage(null);
                    setPreviewUrl("");
                  }}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "white",
                    "&:hover": { bgcolor: "white" },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: "center",
            gap: "12px",
            marginTop: "8px",
            fontFamily: "Montserrat",
          }}
        >
          <Button
            onClick={() => setIsNewFeedbackOpen(false)}
            variant="outlined"
            sx={{
              textTransform: "uppercase",
              fontFamily: "Montserrat",
              fontWeight: "bold",
              color: "#67ADC1",
              borderColor: "#67ADC1",
              padding: "8px 24px",
              ":hover": {
                borderColor: "#67ADC1",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitFeedback}
            variant="contained"
            sx={{
              textTransform: "uppercase",
              fontFamily: "Montserrat",
              fontWeight: "bold",
              color: "#FFFFFF",
              backgroundColor: "#8BD3E6",
              border: "1px solid #8BD3E6",
              borderRadius: "8px",
              padding: "8px 24px",
              boxShadow: "none",
              "&:hover": {
                boxShadow: "none",
                backgroundColor: "#6FBCCF",
                borderColor: "#6FBCCF",
              },
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={(event, reason) => {
          if (reason === "clickaway") {
            return;
          }
          handleSnackbarClose();
          if (snackbar.reload) {
            window.location.reload();
          }
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.type === "error" ? "error" : "success"}
          sx={{
            width: "100%",
            bgcolor: snackbar.type === "error" ? "#F44336" : "#4CAF50",
            color: "white",
            "& .MuiAlert-icon": {
              color: "white",
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerInbox;
