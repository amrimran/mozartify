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
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import AdminSidebar from "./AdminSidebar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminManageUsers = () => {
  const [activeTab, setActiveTab] = useState("customers"); // State for active tab
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const currentClerks = [
    { id: 1, name: "Adela Parkson", role: "Music Entry Clerk 1", avatar: "/api/placeholder/40/40" },
    { id: 2, name: "Christian Mad", role: "Music Entry Clerk 2", avatar: "/api/placeholder/40/40" },
    { id: 3, name: "Jason Statham", role: "Music Entry Clerk 3", avatar: "/api/placeholder/40/40" },
  ];

  const customers = [
    { id: 1, name: "John Doe", email: "john@example.com", avatar: "/api/placeholder/40/40" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", avatar: "/api/placeholder/40/40" },
  ];

  const admins = [
    { id: 1, name: "Admin User", email: "admin@example.com", avatar: "/api/placeholder/40/40" },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:3000/current-user");
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching current user:", error);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  const renderContent = () => {
    let data;
    let title;

    switch (activeTab) {
      case "clerks":
        data = currentClerks;
        title = "Current Music Entry Clerks";
        break;
      case "customers":
        data = customers;
        title = "Current Customers";
        break;
      case "admins":
        data = admins;
        title = "Current Admins";
        break;
      default:
        return null;
    }

    return (
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontFamily: "Montserrat", fontWeight: "bold" }}>
            {title}
          </Typography>
          {(activeTab === "clerks" || activeTab === "admins") && (
            <Button
              startIcon={<AddIcon />}
              sx={{
                bgcolor: "#8BD3E6",
                color: "white",
                "&:hover": { bgcolor: "#3B3183" },
                textTransform: "none",
                fontFamily: "Montserrat",
              }}
            >
              Add
            </Button>
          )}
        </Box>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          }}
        >
          {data.map((item) => (
            <Paper
              key={item.id}
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
                <Avatar src={item.avatar} sx={{ mr: 2 }} />
                <Box>
                  <Typography
                    variant="body1"
                    sx={{ fontFamily: "Montserrat", fontWeight: "bold" }}
                  >
                    {item.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: "Montserrat", color: "text.secondary" }}
                  >
                    {item.role || item.email}
                  </Typography>
                </Box>
              </Box>
              <Box>
                {activeTab !== "customers" && (
                  <IconButton size="small" sx={{ mr: 1 }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
                <IconButton size="small" sx={{ color: "#D32F2F" }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <AdminSidebar active="manage-users" />
      <Box
        sx={{
          flexGrow: 1,
          p: 2.5,
          marginLeft: "225px", // Match the sidebar width
          minHeight: "100vh",
          bgcolor: "#FFFFFF", // Light background
          overflowX: "hidden",
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
        <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Montserrat', fontWeight: 'bold', mt: 4 }}>
          
            Manage User Accounts
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body1" sx={{ mr: 2, fontFamily: "Montserrat" }}>
              {loading ? "Loading..." : user?.username || "Admin"}
            </Typography>
            <Avatar>{user ? user.username.charAt(0) : "A"}</Avatar>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Tabs Section */}
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
        textTransform: "none", // Prevents all caps
        color: "#666", // Default color for tabs
        "&:hover": {
          color: "#8BD3E6", // Hover color
        },
      },
      "& .Mui-selected": {
        color: "#8BD3E6 !important", // Force the active color to override defaults
        fontWeight: "normal", // Ensures the active tab is not bold
      },
      "& .MuiTabs-indicator": {
        backgroundColor: "#8BD3E6", // Active tab indicator color
      },
    }}
  >
    <Tab value="customers" label="Customers" />
    <Tab value="clerks" label="Music Entry Clerks" />
    <Tab value="admins" label="Admins" />
  </Tabs>
</Box>


        {/* Render Content */}
        {renderContent()}
      </Box>
    </Box>
  );
};

export default AdminManageUsers;
