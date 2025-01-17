import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Avatar,
  Skeleton,
  Snackbar,
  Alert,
  Divider,
  TablePagination,
  Tooltip,
  useMediaQuery,
  AppBar,
  Toolbar,
  Drawer,
  useTheme,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DeleteIcon from "@mui/icons-material/Delete";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AdminSidebar from "./AdminSidebar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { createGlobalStyle } from "styled-components";

const DRAWER_WIDTH = 230;

const AdminInbox = () => {
  const [feedbackData, setFeedbackData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [newReply, setNewReply] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const drawerRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [page, setPage] = useState(0); // Current page (zero-indexed)
  const [rowsPerPage, setRowsPerPage] = useState(5); // Number of rows per page
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = createTheme({
    typography: {
      fontFamily: "Montserrat, Arial, sans-serif",
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            "& label": { fontFamily: "Montserrat" },
            "& input": { fontFamily: "Montserrat" },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontFamily: "Montserrat",
            textTransform: "none",
          },
        },
      },
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
  });

  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const GlobalStyle = createGlobalStyle`
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        max-width: 100%;
        overflow-x: hidden;
        font-family: 'Montserrat', sans-serif;
      }
    `;

  const styles = {
    root: {
      display: "flex",
      backgroundColor: "#FFFFFF",
      minHeight: "100vh",
      margin: 0,
      padding: 0,
      width: "100%",
      maxWidth: "100%",
      overflowX: "hidden",
      position: "relative",
    },
    appBar: {
      display: isLargeScreen ? "none" : "block",
      backgroundColor: "#FFFFFF",
      boxShadow: "none",
      borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    },
    drawer: {
      width: DRAWER_WIDTH,
      flexShrink: 0,
      display: isLargeScreen ? "block" : "none",
      "& .MuiDrawer-paper": {
        boxSizing: "border-box",
        minHeight: "100vh",
      },
      minHeight: "100vh",
    },
    mobileDrawer: {
      display: isLargeScreen ? "none" : "block",
      "& .MuiDrawer-paper": {
        boxSizing: "border-box",
        minHeight: "100vh",
      },
      minHeight: "100vh",
    },
    mainContent: {
      flexGrow: 1,
      p: 3,
      overflowX: isLargeScreen ? "hidden" : "auto",
      width: "100%",
      mt: isLargeScreen ? 0 : 8,
    },
    menuButton: {
      color: "#3B3183",
      mr: 2,
      display: isLargeScreen ? "none" : "block",
    },
    avatar: {
      width: isMobile ? 120 : 150,
      height: isMobile ? 120 : 150,
      border: "4px solid #3B3183",
      backgroundColor: "#F2F2F5",
      color: "#3B3183",
      fontSize: isMobile ? 48 : 60,
    },
    contentContainer: {
      maxWidth: {
        xs: "100%",
        sm: "540px",
        md: "720px",
        lg: "960px",
      },
    },
    button: {
      px: 4,
      py: 1.5,
      fontWeight: "bold",
      color: "#FFFFFF",
      backgroundColor: "#8BD3E6",
      boxShadow: "none",
      "&:hover": {
        boxShadow: "none",
        backgroundColor: "#6FBCCF",
      },
      width: isMobile ? "100%" : "auto",
      minWidth: !isMobile ? "250px" : undefined,
    },
    deleteButton: {
      px: 4,
      py: 1.5,
      fontWeight: "bold",
      color: "#FFFFFF",
      backgroundColor: "#DB2226",
      boxShadow: "none",
      "&:hover": {
        boxShadow: "none",
        backgroundColor: "#B71C1C",
      },
      width: isMobile ? "95%" : "250px",
    },
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success",
    reload: false,
  });

  // Configure axios with credentials
  axios.defaults.withCredentials = true;

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedFeedbackData = [...feedbackData].sort((a, b) => {
    if (sortConfig.key) {
      const valueA =
        sortConfig.key === "date"
          ? new Date(
              a.replies?.length > 0
                ? a.replies[a.replies.length - 1].date
                : a.feedbackDate
            )
          : a[sortConfig.key];
      const valueB =
        sortConfig.key === "date"
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

  // Skeleton component with enhanced animation
  const TableRowSkeleton = () => (
    <TableRow
      sx={{
        opacity: isLoading ? 1 : 0,
        transition: "opacity 0.3s ease-in-out",
      }}
    >
      <TableCell>
        <Skeleton
          animation="pulse"
          height={24}
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
      <TableCell>
        <Skeleton
          animation="pulse"
          height={24}
          width="80%"
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
      <TableCell>
        <Skeleton
          animation="pulse"
          height={24}
          width="60%"
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
      <TableCell>
        <Box sx={{ display: "flex", gap: 1 }}>
          {[1, 2, 3].map((index) => (
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
        {["Customer", "Title", "Last Updated", "Status", "Actions"].map(
          (header, index) => (
            <TableCell
              key={index} // Use index as the key since the actual header is not displayed
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
          )
        )}
      </TableRow>
    </TableHead>
  );

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
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:3002/api/feedback");
      // Artificial delay of 1 second for smooth loading animation
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

  // Update the existing handlers to show notifications
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
        sender: reply.sender,
      })),
    ];

    setChatMessages(messages);
    setDrawerOpen(true);
  };

  const handleSendReply = async () => {
    if (!newReply.trim() || !selectedFeedback) return;

    try {
      const response = await axios.post(
        `http://localhost:3002/api/feedback/reply/${selectedFeedback._id}`,
        {
          message: newReply,
          sender: "admin",
        }
      );

      const newMessage = {
        type: "reply",
        content: newReply,
        date: new Date(),
        sender: "admin",
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

  const handleMarkAsResolved = async (id) => {
    try {
      const response = await axios.patch(
        `http://localhost:3002/api/feedback/status/${id}`,
        {
          status: "resolved",
        }
      );

      setFeedbackData((prev) =>
        prev.map((feedback) => (feedback._id === id ? response.data : feedback))
      );
      showNotification("Feedback marked as resolved");
    } catch (error) {
      console.error("Error updating status:", error);
      showNotification("Failed to update status", "error");
    }
  };
  const isSenderMessage = (message) => {
    return message.sender === "admin";
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={styles.root}>
        <AppBar position="fixed" sx={styles.appBar}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                edge="start"
                onClick={handleDrawerToggle}
                sx={styles.menuButton}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h6"
                noWrap
                sx={{ color: "#3B3183", fontWeight: "bold" }}
              >
                Inbox
              </Typography>
            </Box>

            {!isLargeScreen && currentUser && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="body1"
                  sx={{
                    mr: 2,
                    color: "#3B3183",
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  {currentUser.username}
                </Typography>
                <Avatar
                  alt={currentUser.username}
                  src={currentUser.profile_picture}
                  sx={{
                    width: 32,
                    height: 32,
                    border: "2px solid #3B3183",
                  }}
                >
                  {currentUser.username.charAt(0).toUpperCase()}
                </Avatar>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        <Drawer variant="permanent" sx={styles.drawer} open>
          <AdminSidebar active="inbox" />
        </Drawer>

        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={styles.mobileDrawer}
        >
          <AdminSidebar active="inbox" />
        </Drawer>

        <Divider sx={{ mb: 4 }} />

        <Box component="main" sx={styles.mainContent}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            {isLargeScreen && (
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                Inbox
              </Typography>
            )}

            {isLargeScreen && currentUser && (
              <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  {currentUser.username}
                </Typography>
                <Avatar
                  alt={currentUser.username}
                  src={currentUser.profile_picture}
                  sx={{ width: 40, height: 40 }}
                >
                  {currentUser.username.charAt(0).toUpperCase()}
                </Avatar>
              </Box>
            )}
          </Box>

          {isLargeScreen && <Divider sx={{ mb: 4 }} />}
          <TableContainer
            component={Paper}
            sx={{
              mt: 2,
              overflowX: "auto",
              "& .MuiTable-root": {
                minWidth: isMobile ? 300 : 900,
              },
            }}
          >
            <Box
              sx={{
                overflow: isLargeScreen ? "hidden" : "auto",
                width: "100%",
                "&::-webkit-scrollbar": {
                  height: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#f1f1f1",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#888",
                  borderRadius: "4px",
                  "&:hover": {
                    backgroundColor: "#555",
                  },
                },
              }}
            >
              <Table
                sx={{
                  minWidth: isLargeScreen
                    ? "auto"
                    : {
                        xs: "1000px",
                        sm: "100%",
                      },
                }}
              >
                {/* Table Head */}
                {isLoading ? (
                  <TableHeadSkeleton />
                ) : (
                  <TableHead sx={{ bgcolor: "#8BD3E6" }}>
                    <TableRow>
                      {[
                        { label: "Customer", key: "username" },
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
                            padding: "20px 16px",
                            borderBottom: "1px solid #8BD3E6",
                            cursor: header.key ? "pointer" : "default",
                            width: header.width,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            {header.label}
                            {header.key && (
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: "12px",
                                  color:
                                    sortConfig.key === header.key
                                      ? "white"
                                      : "rgba(255, 255, 255, 0.7)",
                                  fontWeight:
                                    sortConfig.key === header.key
                                      ? "bold"
                                      : "normal",
                                }}
                              >
                                {sortConfig.key === header.key
                                  ? sortConfig.direction === "asc"
                                    ? "▲" // Highlight active ascending sort
                                    : "▼" // Highlight active descending sort
                                  : "▲ ▼"}{" "}
                                {/* Show inactive arrows */}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                )}

                <TableBody>
                  {isLoading
                    ? [...Array(rowsPerPage)].map((_, index) => (
                        <TableRowSkeleton key={index} />
                      ))
                    : sortedFeedbackData
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((row) => (
                          <TableRow
                            key={row._id}
                            sx={{
                              fontFamily: "'Montserrat', sans-serif",
                              fontSize: "15px",
                              padding: "16px",
                              color: "#333",
                              maxWidth: "300px",
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
                                maxWidth: "100px",
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                              }}
                            >
                              {row.username}
                            </TableCell>
                            <TableCell
                              sx={{
                                fontFamily: "'Montserrat', sans-serif",
                                fontSize: "14px",
                                padding: "16px",
                                color: "#333",
                                maxWidth: "300px", // Limit width to trigger ellipsis
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
                                textTransform: "uppercase",
                                padding: "16px",
                                color:
                                  row.status === "resolved"
                                    ? "#28A745"
                                    : "#FFB400",
                                fontWeight: "bold",
                              }}
                            >
                              {row.status || "pending"}
                            </TableCell>
                            <TableCell
                              sx={{
                                padding: "16px",
                                display: "flex",
                                gap: "8px",
                                justifyContent: "start", // Align icons properly
                              }}
                            >
                              {/* Resolve Icon */}
                              <IconButton
                                onClick={() =>
                                  row.status !== "resolved" &&
                                  handleMarkAsResolved(row._id)
                                }
                                disabled={row.status === "resolved"}
                                sx={{
                                  color:
                                    row.status === "resolved"
                                      ? "#CCCCCC"
                                      : "#28A745", // Grey color for disabled
                                  ":hover": {
                                    bgcolor: "transparent",
                                  },
                                  cursor:
                                    row.status === "resolved"
                                      ? "not-allowed"
                                      : "pointer", // Show not-allowed cursor when disabled
                                }}
                              >
                                <CheckCircleIcon sx={{ fontSize: "20px" }} />
                              </IconButton>

                              {/* Chat Icon */}
                              <IconButton
                                onClick={() => handleOpenChat(row)}
                                sx={{
                                  color: "#8BD3E6",
                                  padding: "6px",
                                  borderRadius: "8px",
                                  ":hover": {
                                    bgcolor: "transparent",
                                  },
                                }}
                              >
                                <ChatIcon sx={{ fontSize: "20px" }} />
                              </IconButton>

                              {/* Delete Icon */}
                              <IconButton
                                onClick={() => handleDelete(row._id)}
                                sx={{
                                  color: "#DB2226",
                                  ":hover": {
                                    bgcolor: "transparent",
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
            </Box>

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

        {/* Chat Drawer */}
        <Box
          ref={drawerRef}
          sx={{
            position: "fixed",
            right: drawerOpen ? 0 : "-1000px",
            top: {
              xs: "56px", // Mobile app bar height
              sm: "64px", // Slightly taller on small screens
              lg: 0, // No offset on large screens
            },
            width: {
              xs: "80%",
              sm: "60%",
              md: "50%",
              lg: "400px",
            },
            height: {
              xs: "calc(100vh - 56px)",
              sm: "calc(100vh - 64px)",
              lg: "100vh",
            },
            bgcolor: "white",
            boxShadow: "-4px 0 12px rgba(0, 0, 0, 0.15)",
            transition: "right 0.3s ease",
            display: "flex",
            flexDirection: "column",
            fontFamily: "'Montserrat', sans-serif",
            zIndex: 1200, // Ensure it's above other elements
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
                fontSize: { xs: "16px", sm: "18px" }, // Responsive font size
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
              p: { xs: 1, sm: 2 }, // Responsive padding
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
                    maxWidth: { xs: "90%", sm: "80%" }, // Wider messages on mobile
                    p: { xs: 1.5, sm: 2 }, // Responsive padding
                    borderRadius: 2,
                    bgcolor: isSenderMessage(message) ? "#8BD3E6" : "#FFFFFF",
                    color: isSenderMessage(message) ? "white" : "black",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: { xs: "13px", sm: "14px" }, // Responsive font size
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
                      fontSize: { xs: "11px", sm: "12px" }, // Responsive font size
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
              p: { xs: 1, sm: 2 }, // Responsive padding
              borderTop: "1px solid #E0E0E0",
              bgcolor: "#FFFFFF",
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder={
                  selectedFeedback?.status === "resolved"
                    ? "Reply disabled for resolved items"
                    : "Type your reply..."
                }
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                size="small"
                multiline
                maxRows={4}
                disabled={selectedFeedback?.status === "resolved"}
                sx={{
                  bgcolor:
                    selectedFeedback?.status === "resolved"
                      ? "#E0E0E0"
                      : "#F8FAFC",
                  fontFamily: "'Montserrat', sans-serif",
                  "& .MuiOutlinedInput-root": {
                    height: { xs: "40px", sm: "auto" }, // Constrain height on mobile
                    minHeight: { xs: "40px", sm: "auto" },
                    "& fieldset": {
                      border:
                        selectedFeedback?.status === "resolved"
                          ? "none" // Remove border when disabled
                          : "1px solid #8BD3E6", // Default border when enabled
                    },
                    "&:hover fieldset": {
                      borderColor:
                        selectedFeedback?.status === "resolved"
                          ? "none" // Ensure no border on hover when disabled
                          : "#6FBCCF", // Darker blue on hover when enabled
                    },
                    "&.Mui-focused fieldset": {
                      borderColor:
                        selectedFeedback?.status === "resolved"
                          ? "none" // Ensure no border on focus when disabled
                          : "#8BD3E6", // Keep blue on focus when enabled
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: { xs: "12px", sm: "14px" }, // Responsive input font size
                    padding: { xs: "8px 10px", sm: "10px 14px" }, // Tighter mobile padding
                    height: { xs: "24px", sm: "auto" }, // Constrain input height on mobile
                  },
                  "& .MuiInputBase-root": {
                    fontSize: { xs: "12px", sm: "14px" }, // Consistent base font size
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: { xs: "12px", sm: "14px" }, // Responsive label font size
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
    </ThemeProvider>
  );
};

export default AdminInbox;
