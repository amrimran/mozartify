import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Avatar,
  Typography,
  Button,
  Divider,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import AdminSidebar from "./AdminSidebar";
import { PersonOutline, CloudUpload, CloudDownload, NotificationsOutlined } from "@mui/icons-material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
`;

const buttonStyles = {
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#8BD3E6",
  borderColor: "#8BD3E6",
  "&:hover": {
    backgroundColor: "#8BD3E6",
    color: "#FFFFFF",
    borderColor: "#8BD3E6",
  },
};

const cardStyles = {
  borderRadius: 4,
  p: 2,
  maxWidth: "300px",
  margin: "0 auto",
};

const typographyStyles = {
  fontFamily: "Montserrat",
  fontWeight: "bold",
};

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(5); // Dummy inbox notifications
  const navigate = useNavigate();

  const statsData = [
    {
      title: "Total Users",
      value: "1,234",
      icon: <PersonOutline sx={{ fontSize: 40, color: "#3B3183" }} />,
      
      button: (
        <Button
          variant="outlined"
          sx={{ mt: 2, width: "100%", ...buttonStyles }}
          onClick={() => navigate("/admin-manage-users")}
        >
          Go to Manage User
        </Button>
      ),
    },
    {
      title: "Inbox Notifications",
      value: notifications.toString(),
      icon: <NotificationsOutlined sx={{ fontSize: 40, color: "#FF5722" }} />,
      button: (
        <Button
          variant="outlined"
          sx={{ mt: 2, width: "100%", ...buttonStyles }}
          onClick={() => navigate("/admin-inbox")}
        >
          Go to Inbox
        </Button>
      ),
    },
    {
      title: "Total Uploads",
      value: "856",
      icon: <CloudUpload sx={{ fontSize: 40, color: "#4CAF50" }} />,
      trend: "+23%",
    },
    {
      title: "Total Downloads",
      value: "2,856",
      icon: <CloudDownload sx={{ fontSize: 40, color: "#FF9800" }} />,
      trend: "+18%",
    },
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

  const uploadsData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Uploads",
        data: [12, 19, 7, 14, 25, 18],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderRadius: 6,
      },
    ],
  };

  const downloadsData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Downloads",
        data: [8, 15, 10, 20, 22, 30],
        borderColor: "rgba(153, 102, 255, 0.6)",
        backgroundColor: "rgba(153, 102, 255, 0.3)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: "#e0e0e0",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <>
      <GlobalStyle />
<Box sx={{ display: "flex", height: "100vh" }}>
  <AdminSidebar active="dashboard" />
  <Box
    sx={{
      flexGrow: 1,
      p: 3,
      display: "flex",
      flexDirection: "column",
      marginLeft: "225px",
      minHeight: "100vh",
    }}
  >
    {/* Header */}
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2, // Reduced margin-bottom
        mt: 2,
      }}
    >
    <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Montserrat', fontWeight: 'bold', mt: 4, ml:1 }}>
      
        Dashboard
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography variant="body1" sx={{ mr: 2, fontFamily: "Montserrat" }}>
          {loading ? "Loading..." : user?.username || "Admin"}
        </Typography>
        <Avatar>{user ? user.username[0] : "A"}</Avatar>
      </Box>
    </Box>

    <Divider sx={{ my: 1 }} />

    {/* Stats Cards */}
    <Grid
      container
      spacing={2} // Reduced spacing between the cards
      sx={{
        maxWidth: "800px", // Aligned max width for centering
        margin: "0 auto", // Centers cards horizontally
      }}
    >
      {statsData.map((stat, index) => (
        <Grid item xs={12} md={6} key={index}>
          <Card elevation={2} sx={{ borderRadius: 4, p: 2, maxWidth: "300px", margin: "0 auto" }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {stat.icon}
                <Box sx={{ textAlign: "right" }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: "Montserrat",
                      fontWeight: "bold",
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "Montserrat",
                      color: "#757575",
                    }}
                  >
                    {stat.title}
                  </Typography>
                </Box>
              </Box>
              {stat.trend && (
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    fontFamily: "Montserrat",
                    fontWeight: "bold",
                    color: "#4CAF50",
                  }}
                >
                  {stat.trend} this month
                </Typography>
              )}
              {stat.button}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>

    {/* Graphs Section */}
    <Grid
      container
      spacing={2}
      sx={{
        mt: 10, // Reduced margin-top for the graphs section
        maxWidth: "1300px", // Match stats card width
        margin: "0 auto", // Center graphs horizontally
      }}
    >
      <Grid item xs={12} md={6}>
        <Card elevation={2} sx={{ p: 2, borderRadius: 4, maxWidth: "520px", margin: "0 auto" }}>
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                fontFamily: "Montserrat",
                fontWeight: "bold",
                mb: 1,
              }}
            >
              Upload Statistics
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar data={uploadsData} options={chartOptions} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card elevation={2} sx={{ p: 2, borderRadius: 4, maxWidth: "550px", margin: "0 auto" }}>
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                fontFamily: "Montserrat",
                fontWeight: "bold",
                mb: 1,
              }}
            >
              Download Trends
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line data={downloadsData} options={chartOptions} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
</Box>

</>
  );}