import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Button,
  Tabs,
  Tab,
  Paper,
  Divider,
  Modal,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Radio,
  RadioGroup,
  FormControlLabel,
  InputAdornment,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Drawer,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import AdminSidebar from "./AdminSidebar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { API_BASE_URL, API_BASE_URL_3} from './config/api.js';

const DRAWER_WIDTH = 225;

// Theme setup
const theme = createTheme({
  typography: {
    fontFamily: "Montserrat, Arial, sans-serif",
  },
  breakpoints: {
    values: {
      xs: 0, // mobile phones
      sm: 600, // tablets
      md: 960, // small laptops
      lg: 1280, // desktops
      xl: 1920, // large screens
    },
  },
});

const textFieldStyles = {
  "& label.Mui-focused": {
    color: "#8BD3E6", // Vibrant indigo for focus
    fontWeight: "bold", // Adds emphasis to the label on focus
  },
  fontFamily: "Montserrat",
  "& .MuiInputBase-root": {
    fontFamily: "Montserrat",
    borderRadius: "12px", // Slightly more rounded corners for a modern feel
    boxShadow: "0px 4px 6px rgba(139, 211, 230, 0.2)",
    backgroundColor: "rgba(235, 251, 255, 0.9)",
  },
  "& .MuiFormLabel-root": {
    fontFamily: "Montserrat",
    fontSize: "15px", // Slightly larger for readability
    color: "#467B89",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "#8BD3E6", // Matches the focus label color
    transform: "scaleX(1)", // Smooth underline animation
    borderWidth: "2px", // Slightly thicker for better visibility
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#C8EAF2", // Soft gray for the default border
    },
    "&:hover fieldset": {
      borderColor: "#8BD3E6", // Softer indigo for hover
      boxShadow: "0px 6px 16px rgba(139, 211, 230, 0.4)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#8BD3E6", // Vibrant indigo for focus
      boxShadow: "0px 8px 20px rgba(139, 211, 230, 0.6)",
    },
    borderRadius: "12px", // Matches the input base for consistent design
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Slightly opaque white for contrast
  },
};

const AdminManageUsers = () => {
  const [activeTab, setActiveTab] = useState("customers");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const navigate = useNavigate();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [mobileOpen, setMobileOpen] = useState(false);

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
  });

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Fetch current user (for displaying the admin info)
  const [currentUser, setCurrentUser] = useState(null);
  //error
  const [errorMessage, setErrorMessage] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [originalUser, setOriginalUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Responsive styles
  const styles = {
    root: {
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "#FFFFFF",
    },
    appBar: {
      display: isLargeScreen ? "none" : "block",
      backgroundColor: "#FFFFFF",
      boxShadow: "none",
      borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
      width: { sm: "100%" },
      ml: { sm: 0 },
      fontFamily: "Montserrat",
    },
    drawer: {
      width: DRAWER_WIDTH,
      flexShrink: 0,
      display: isLargeScreen ? "block" : "none",
      "& .MuiDrawer-paper": {
        width: DRAWER_WIDTH,
        boxSizing: "border-box",
      },
    },
    mobileDrawer: {
      display: isLargeScreen ? "none" : "block",
      "& .MuiDrawer-paper": {
        width: DRAWER_WIDTH,
        boxSizing: "border-box",
      },
    },
    mainContent: {
      flexGrow: 1,
      p: { xs: 2, sm: 3 },
      ml: isLargeScreen ? 1 : 0,
      mt: isLargeScreen ? 2 : 8,
      width: isLargeScreen ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      mb: { xs: 2, sm: 3 },
      flexDirection: { xs: "column", sm: "row" },
    },
    userGrid: {
      display: "grid",
      gap: { xs: 1, sm: 2 },
      gridTemplateColumns: {
        xs: "1fr",
        sm: "repeat(auto-fill, minmax(300px, 1fr))",
      },
      mt: { xs: 1, sm: 3 },
    },
    tabs: {
      "& .MuiTab-root": {
        fontFamily: "Montserrat",
        textTransform: "none",
        color: "#666",
        minWidth: { xs: "auto", sm: 160 },
        px: { xs: 2, sm: 3 },
        "&:hover": { color: "#8BD3E6" },
      },
      "& .Mui-selected": {
        color: "#8BD3E6 !important",
        fontWeight: "normal",
      },
      "& .MuiTabs-indicator": {
        backgroundColor: "#8BD3E6",
      },
    },
    userCard: (theme) => ({
      p: { xs: 2, sm: 3 },
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: 2,
      flexDirection: { xs: "column", sm: "row" },
      gap: { xs: 2, sm: 0 },
      [theme.breakpoints.down("sm")]: {
        textAlign: "center",
      },
    }),
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const formatRole = (role) => {
    const roleMapping = {
      customer: "Customer",
      music_entry_clerk: "Music Entry Clerk",
      admin: "Admin",
    };

    return roleMapping[role] || "Unknown Role"; // Fallback for unexpected roles
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setOriginalUser(user); // Keep the original data for comparison
    setEditModalOpen(true);
  };

  const hasChanges = () => {
    return JSON.stringify(selectedUser) !== JSON.stringify(originalUser);
  };

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

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL_3}/users`);
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleCloseModal = () => {
    setOpenModal(false);
    // Reset all form fields
    setNewUser({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
    });
    setErrorMessage(""); // Clear any error messages
  };

  // Update user's approval status
  const handleUpdateApproval = async (id, status) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL_3}/users/${id}/approval`,
        {
          approval: status,
        }
      );
      setUsers(users.map((user) => (user._id === id ? response.data : user)));
    } catch (error) {
      console.error(
        "Error updating approval:",
        error.response?.data || error.message
      );
      alert("Failed to update approval status. Please try again.");
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      // Close the dialog immediately to prevent double triggers
      setDeleteDialogOpen(false);

      try {
        console.log("Deleting user:", userToDelete);

        // Directly call the delete endpoint
        const deleteResponse = await axios.delete(
          `${API_BASE_URL_3}/users/${userToDelete._id}`
        );
        console.log("User successfully deleted:", deleteResponse.data);

        // Update local state
        setUsers(users.filter((user) => user._id !== userToDelete._id));
        setUserToDelete(null);
      } catch (error) {
        console.error("Error during user deletion:", error);
        alert("An error occurred while deleting the user. Please try again.");
      }
    }
  };

  const handleAddUser = async () => {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

    const formatErrorMessage = (message) => (
      <Typography
        color="error"
        variant="body2"
        align="center"
        sx={{
          mt: 2,
          fontFamily: "Montserrat", // Apply Montserrat font
        }}
      >
        {message}
      </Typography>
    );

    // Ensure all fields are filled
    if (
      !newUser.username ||
      !newUser.email ||
      !newUser.password ||
      !newUser.confirmPassword ||
      !newUser.role
    ) {
      setErrorMessage(formatErrorMessage("Please fill in all the fields."));
      return;
    }

    // Validate password format
    if (!passwordRegex.test(newUser.password)) {
      setErrorMessage(
        formatErrorMessage(
          "Password must be at least 8 characters long and include both letters and numbers."
        )
      );
      return;
    }

    // Validate passwords match
    if (newUser.password !== newUser.confirmPassword) {
      setErrorMessage(formatErrorMessage("Passwords do not match."));
      return;
    }

    // Set approval status based on role
    const approvalStatus = newUser.role === "customer" ? "approved" : "pending";

    // Add approval status to the newUser object
    const userToAdd = {
      ...newUser,
      approval: approvalStatus,
    };

    // Proceed with adding the user
    try {
      const response = await axios.post(
        `${API_BASE_URL_3}/users`,
        userToAdd
      );
      setUsers([...users, response.data]); // Add the new user to the state
      handleCloseModal(); // Close modal and reset form
    } catch (error) {
      console.error("Error adding user:", error);

      if (error.response && error.response.data) {
        // Display specific error message from the server
        setErrorMessage(
          formatErrorMessage(error.response.data.error || "Failed to add user.")
        );
      } else {
        setErrorMessage(
          formatErrorMessage("An error occurred while adding the user.")
        );
      }
    }
  };

  const handleSaveEdit = async () => {
    try {
      const response = await axios.put(
        `${API_BASE_URL_3}/users/${selectedUser._id}`,
        selectedUser
      );

      // Update the users list
      setUsers(
        users.map((user) =>
          user._id === selectedUser._id ? response.data : user
        )
      );

      // Open success dialog
      setSuccessDialogOpen(true);

      // Close the modal and reset selection
      setEditModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user. Please try again.");
    }
  };

  const renderContent = () => {
    if (loading) {
      return <Typography>Loading...</Typography>;
    }

    const activeUsers = users.filter((user) => {
      if (activeTab === "clerks")
        return (
          user.role === "music_entry_clerk" && user.approval === "approved"
        );
      if (activeTab === "customers") return user.role === "customer";
      if (activeTab === "admins")
        return user.role === "admin" && user.approval === "approved";
      return false;
    });

    const pendingUsers = users.filter((user) => {
      if (activeTab === "clerks")
        return user.role === "music_entry_clerk" && user.approval === "pending";
      if (activeTab === "admins")
        return user.role === "admin" && user.approval === "pending";
      return false;
    });

    const tabTitles = {
      clerks: "Existing Music Entry Clerks",
      customers: "Customers",
      admins: "Existing Admins",
    };

    return (
      <Box>
        {/* Active Users Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontFamily: "Montserrat", fontWeight: "bold" }}
          >
            {tabTitles[activeTab]}
          </Typography>

          <Button
            startIcon={
              <AddIcon sx={{ fontSize: { xs: "1rem", sm: "1.5rem" } }} />
            }
            sx={{
              px: { xs: 1, sm: 2 },
              fontSize: { xs: "0.75rem", sm: "1rem" },
              bgcolor: "#8BD3E6",
              color: "white",
              "&:hover": { bgcolor: "#6FBCCF" },
              textTransform: "none",
              fontFamily: "Montserrat",
            }}
            onClick={() => {
              setNewUser({
                ...newUser,
                role:
                  activeTab === "clerks"
                    ? "music_entry_clerk"
                    : activeTab === "admins"
                      ? "admin"
                      : "customer",
              });
              setOpenModal(true);
            }}
          >
            Add
          </Button>
        </Box>
        {activeUsers.length > 0 ? (
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            }}
          >
            {activeUsers.map((user) => (
              <Paper
                key={user._id}
                elevation={3}
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    src={user.profile_picture || "/api/placeholder/40/40"}
                    sx={{ mr: 2 }}
                  />
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{ fontFamily: "Montserrat", fontWeight: "bold" }}
                    >
                      {user.username}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "Montserrat", color: "text.secondary" }}
                    >
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <IconButton
                    size="small"
                    sx={{ color: "#8BD3E6" }} // Use a color to distinguish the Edit button
                    onClick={() => handleEditUser(user)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    size="small"
                    sx={{ color: "#D32F2F" }}
                    onClick={() => openDeleteDialog(user)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Box>
        ) : (
          <Typography sx={{ mt: 2, color: "gray", fontFamily: "Montserrat" }}>
            No existing{" "}
            {activeTab === "clerks"
              ? "Music Entry Clerks"
              : activeTab === "admins"
                ? "Admins"
                : "Customers"}{" "}
            found.
          </Typography>
        )}

        {/* Pending Users Section */}
        {activeTab !== "customers" && (
          <>
            <Typography
              variant="h6"
              sx={{ mt: 4, fontFamily: "Montserrat", fontWeight: "bold" }}
            >
              {activeTab === "clerks"
                ? "Pending Music Entry Clerks"
                : "Pending Admins"}
            </Typography>
            {pendingUsers.length > 0 ? (
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  mt: 2,
                }}
              >
                {pendingUsers.map((user) => (
                  <Paper
                    key={user._id}
                    elevation={3}
                    sx={{
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        src={user.profile_picture || "/api/placeholder/40/40"}
                        sx={{ mr: 2 }}
                      />
                      <Box>
                        <Typography
                          variant="body1"
                          sx={{ fontFamily: "Montserrat", fontWeight: "bold" }}
                        >
                          {user.username}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "Montserrat",
                            color: "text.secondary",
                          }}
                        >
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        sx={{ color: "#4CAF50", mr: 1 }}
                        onClick={() =>
                          handleUpdateApproval(user._id, "approved")
                        }
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{ color: "#F44336" }}
                        onClick={() => handleUpdateApproval(user._id, "denied")}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Typography
                sx={{ mt: 2, color: "gray", fontFamily: "Montserrat" }}
              >
                No pending{" "}
                {activeTab === "clerks" ? "Music Entry Clerks" : "Admins"}{" "}
                found.
              </Typography>
            )}
          </>
        )}
      </Box>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={styles.root}>
        {/* Mobile AppBar */}
        <AppBar position="fixed" sx={styles.appBar}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, color: "#3B3183" }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              sx={{
                fontFamily: "Montserrat",
                fontWeight: "bold",
                color: "#3B3183",
                flexGrow: 1,
              }}
            >
              Manage Users
            </Typography>
            {!isLargeScreen && currentUser && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {!isMobile && (
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "Montserrat",
                      color: "#3B3183",
                    }}
                  >
                    {currentUser.username}
                  </Typography>
                )}
                <Avatar
                  alt={currentUser.username}
                  src={currentUser.profile_picture}
                  sx={{
                    width: 32,
                    height: 32,
                    fontFamily: "Montserrat",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}
                >
                  {currentUser.username?.charAt(0).toUpperCase()}
                </Avatar>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        {/* Permanent drawer for large screens */}
        <Drawer variant="permanent" sx={styles.drawer}>
          <AdminSidebar active="manage-users" />
        </Drawer>

        {/* Temporary drawer for mobile/tablet */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={styles.mobileDrawer}
        >
          <AdminSidebar active="manage-users" />
        </Drawer>

        {/* Main content */}
        <Box component="main" sx={styles.mainContent}>
          {/* Header with user info */}

          {isLargeScreen && (
            <>
              <Box sx={styles.header}>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: "Montserrat",
                    fontWeight: "bold",
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" },
                  }}
                >
                  Manage User Accounts
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body1" sx={{ fontFamily: "Montserrat" }}>
                    {currentUser?.username}
                  </Typography>
                  <Avatar
                    alt={currentUser?.username}
                    src={currentUser?.profile_picture}
                  >
                    {currentUser?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
            </>
          )}

          <Box sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              centered
              textColor="primary"
              indicatorColor="primary"
              sx={{
                "& .MuiTab-root": {
                  fontFamily: "Montserrat",
                  textTransform: "none",
                  color: "#666",
                  "&:hover": { color: "#8BD3E6" },
                },
                "& .Mui-selected": {
                  color: "#8BD3E6 !important",
                  fontWeight: "normal",
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#8BD3E6",
                },
              }}
            >
              <Tab value="customers" label="Customers" />
              <Tab value="clerks" label="Music Entry Clerks" />
              <Tab value="admins" label="Admins" />
            </Tabs>
          </Box>
          {renderContent()}
        </Box>
        {/* Modal for Adding Users */}
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "white",
              borderRadius: "20px",
              boxShadow: 24,
              padding: 4,
              width: { xs: "80%", sm: 400 },
              p: { xs: 3, sm: 4 },
              textAlign: "center",
            }}
          >
            {/* Close Button */}
            <IconButton
              onClick={() => setOpenModal(false)}
              sx={{
                position: "absolute",
                top: "12px",
                right: "12px",
                color: "#555",
                "&:hover": {
                  color: "#D32F2F",
                },
              }}
            >
              &times;
            </IconButton>

            <Typography
              variant="h5"
              align="center"
              fontFamily="Montserrat"
              fontWeight="bold"
              gutterBottom
              sx={{ marginBottom: 2 }}
            >
              Add New User
            </Typography>
            <Typography
              variant="body1"
              align="center"
              fontFamily="Montserrat"
              gutterBottom
              sx={{ marginBottom: 2 }}
            >
              Fill this form to create a new user account
            </Typography>

            {/* Username Field */}
            <TextField
              fullWidth
              label="Username"
              margin="normal"
              required
              value={newUser.username}
              onChange={(e) =>
                setNewUser({ ...newUser, username: e.target.value })
              }
              sx={textFieldStyles}
            />

            {/* Email Field */}
            <TextField
              fullWidth
              label="Email Address"
              margin="normal"
              variant="outlined"
              required
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              sx={textFieldStyles}
            />

            {/* Password Field */}
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              margin="normal"
              variant="outlined"
              required
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              sx={textFieldStyles}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Confirm Password Field */}
            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              margin="normal"
              variant="outlined"
              required
              value={newUser.confirmPassword}
              onChange={(e) =>
                setNewUser({ ...newUser, confirmPassword: e.target.value })
              }
              sx={textFieldStyles}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleToggleConfirmPasswordVisibility}
                      edge="end"
                      aria-label="toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControl
              fullWidth
              sx={{
                mt: 2,
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  fontFamily: "Montserrat",
                  borderRadius: "12px",
                  boxShadow: "0px 4px 6px rgba(139, 211, 230, 0.2)", // Shadow in blue RGBA
                  "& fieldset": {
                    borderColor: "#8BD3E6", // Default border color
                  },
                  "&:hover fieldset": {
                    borderColor: "#8BD3E6", // Hover border color
                    boxShadow: "0px 6px 16px rgba(139, 211, 230, 0.4)", // Hover shadow effect
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#8BD3E6", // Focus border color
                    boxShadow: "0px 8px 20px rgba(139, 211, 230, 0.6)", // Focus shadow effect
                  },
                },
              }}
            >
              <InputLabel
                id="role-select-label"
                sx={{
                  fontFamily: "Montserrat",
                  fontSize: "14px",
                  color: "#4A5568",
                }}
              >
                Role
              </InputLabel>
              <Select
                labelId="role-select-label"
                id="role-select"
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                label="Role"
                sx={{
                  fontFamily: "Montserrat",
                  fontSize: "14px",
                  borderRadius: "12px",
                  "& .MuiSelect-icon": {
                    color: "#8BD3E6", // Icon color
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#C8EAF2", // Default light blue border
                    },
                    "&:hover fieldset": {
                      borderColor: "#8BD3E6", // Hover blue border
                      boxShadow: "0px 6px 16px rgba(139, 211, 230, 0.4)", // Hover shadow
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#8BD3E6", // Focus blue border
                      boxShadow: "0px 8px 20px rgba(139, 211, 230, 0.6)", // Focus shadow
                    },
                  },
                }}
              >
                <MenuItem
                  value="customer"
                  sx={{ fontFamily: "Montserrat", fontSize: "14px" }}
                >
                  Customer
                </MenuItem>
                <MenuItem
                  value="music_entry_clerk"
                  sx={{ fontFamily: "Montserrat", fontSize: "14px" }}
                >
                  Music Entry Clerk
                </MenuItem>
                <MenuItem
                  value="admin"
                  sx={{ fontFamily: "Montserrat", fontSize: "14px" }}
                >
                  Admin
                </MenuItem>
              </Select>
            </FormControl>

            {/* Error Message */}
            {errorMessage && (
              <Typography
                color="error"
                variant="body2"
                align="center"
                sx={{ mb: 2 }}
              >
                {errorMessage}
              </Typography>
            )}

            {/* Submit Button */}
            <Button
              fullWidth
              variant="contained"
              sx={{
                mt: 1,
                px: 10,
                fontFamily: "Montserrat",
                fontWeight: "bold",
                color: "#FFFFFF",
                backgroundColor: "#8BD3E6",
                border: "1px solid #8BD3E6", // Explicitly define the border
                borderColor: "#8BD3E6",
                boxShadow: "none", // Remove the shadow
                "&:hover": {
                  backgroundColor: "#6FBCCF",
                  color: "#FFFFFF",
                  border: "1px solid #6FBCCF", // Ensure border remains visible on hover
                  boxShadow: "none", // Remove shadow on hover
                },
              }}
              onClick={handleAddUser}
            >
              Add User
            </Button>
          </Box>
        </Modal>

        <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "white",
              borderRadius: "20px",
              boxShadow: 24,
              width: { xs: "80%", sm: 400 },
              p: { xs: 3, sm: 4 },
              textAlign: "center",
              // position: "relative", // Needed to position the close button correctly
            }}
          >
            {/* Close Button (X) */}
            <IconButton
              onClick={() => setEditModalOpen(false)}
              sx={{
                position: "absolute",
                top: "8px",
                right: "8px",
                color: "#555",
                "&:hover": {
                  color: "#D32F2F", // Red color on hover
                },
              }}
            >
              <CloseIcon />
            </IconButton>

            {/* Modal Content */}
            <Typography
              variant="h5"
              align="center"
              fontFamily="Montserrat"
              fontWeight="bold"
              gutterBottom
            >
              Edit User
            </Typography>
            <TextField
              fullWidth
              label="Username"
              margin="normal"
              value={selectedUser?.username || ""}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, username: e.target.value })
              }
              sx={textFieldStyles}
            />
            <TextField
              fullWidth
              label="Email Address"
              margin="normal"
              value={selectedUser?.email || ""}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, email: e.target.value })
              }
              sx={textFieldStyles}
            />
            <Typography
              sx={{
                fontFamily: "Montserrat",
                fontSize: "14px",
                color: "#4A5568",
                textAlign: "left",
                mb: 1,
                mt: 2,
              }}
            >
              Role
            </Typography>
            <FormControl
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontFamily: "Montserrat",
                  borderRadius: "12px",
                  boxShadow: "0px 4px 6px rgba(139, 211, 230, 0.2)", // Shadow in blue RGBA
                  "& fieldset": {
                    borderColor: "#8BD3E6", // Default border color in blue
                  },
                  "&:hover fieldset": {
                    borderColor: "#8BD3E6", // Hover border color in blue
                    boxShadow: "0px 6px 16px rgba(139, 211, 230, 0.4)", // Shadow in blue RGBA
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#8BD3E6", // Focus border color in blue
                    boxShadow: "0px 8px 20px rgba(139, 211, 230, 0.6)", // Shadow in blue RGBA
                  },
                },
              }}
            >
              <Select
                value={selectedUser?.role || ""}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, role: e.target.value })
                }
                sx={{
                  fontFamily: "Montserrat",
                  fontSize: "14px",
                  borderRadius: "12px",
                  padding: "1px 3px",
                  "& .MuiSelect-icon": {
                    color: "#8BD3E6", // Icon color in blue
                  },
                }}
              >
                <MenuItem
                  value="customer"
                  sx={{
                    fontFamily: "Montserrat",
                    fontSize: "14px",
                  }}
                >
                  Customer
                </MenuItem>
                <MenuItem
                  value="music_entry_clerk"
                  sx={{
                    fontFamily: "Montserrat",
                    fontSize: "14px",
                  }}
                >
                  Music Entry Clerk
                </MenuItem>
                <MenuItem
                  value="admin"
                  sx={{
                    fontFamily: "Montserrat",
                    fontSize: "14px",
                  }}
                >
                  Admin
                </MenuItem>
              </Select>
            </FormControl>

            <Button
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                fontFamily: "Montserrat",
                fontWeight: "bold",
                boxShadow: "none",
                color: "#FFFFFF",
                bgcolor: hasChanges() ? "#8BD3E6" : "#CCCCCC", // Gray if disabled
                "&:hover": {
                  bgcolor: hasChanges() ? "#6FBCCF" : "#CCCCCC",
                  boxShadow: "none",
                },
              }}
              onClick={handleSaveEdit}
              disabled={!hasChanges()} // Disable if no changes
            >
              Save Changes
            </Button>
          </Box>
        </Modal>

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
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
              fontFamily: "Montserrat",
              fontWeight: "bold",
              fontSize: "20px",
              textAlign: "center",
              paddingTop: "16px", // To provide space for the close button
            }}
          >
            Confirm Deletion
          </DialogTitle>
          <DialogContent
            sx={{
              fontFamily: "Montserrat",
              textAlign: "center",
            }}
          >
            <DialogContentText
              sx={{
                fontFamily: "Montserrat",
                fontSize: "16px",
                color: "#555",
              }}
            >
              Are you sure you want to delete{" "}
              <strong style={{ color: "#D32F2F" }}>
                {userToDelete?.username}
              </strong>
              ? This action <strong>cannot be undone</strong>.
            </DialogContentText>
          </DialogContent>
          <DialogActions
            sx={{
              justifyContent: "center",
              gap: "12px",
              marginTop: "8px",
            }}
          >
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              sx={{
                textTransform: "uppercase",
                fontFamily: "Montserrat",
                fontWeight: "bold",
                color: "#FFFFFF",
                backgroundColor: "#8BD3E6",
                borderRadius: "8px",
                padding: "8px 24px",
                "&:hover": {
                  bgcolor: "#6FBCCF",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              disabled={loadingDelete}
              sx={{
                textTransform: "uppercase",
                fontFamily: "Montserrat",
                fontWeight: "bold",
                bgcolor: "#D32F2F",
                color: "#FFFFFF",
                borderRadius: "8px",
                padding: "8px 24px",
                "&:hover": {
                  bgcolor: "#B71C1C",
                },
              }}
            >
              {loadingDelete ? "Deleting..." : "Confirm"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={successDialogOpen}
          onClose={() => setSuccessDialogOpen(false)}
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
              fontFamily: "Montserrat",
              fontWeight: "bold",
              fontSize: "20px",
              textAlign: "center",
            }}
          >
            Success
          </DialogTitle>
          <DialogContent
            sx={{
              fontFamily: "Montserrat",
              textAlign: "center",
            }}
          >
            <DialogContentText
              sx={{
                fontFamily: "Montserrat",
                fontSize: "16px",
                color: "#555",
              }}
            >
              User has been updated successfully.
            </DialogContentText>
          </DialogContent>
          <DialogActions
            sx={{
              justifyContent: "center",
              gap: "12px",
              marginTop: "8px",
            }}
          >
            <Button
              onClick={() => setSuccessDialogOpen(false)}
              sx={{
                textTransform: "none",
                fontFamily: "Montserrat",
                fontWeight: "bold",
                color: "#8BD3E6",
                border: "1px solid #8BD3E6",
                borderRadius: "8px",
                padding: "8px 24px",
                "&:hover": {
                  bgcolor: "#ECEFF1",
                },
              }}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default AdminManageUsers;
