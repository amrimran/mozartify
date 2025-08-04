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
  CardActions,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  useMediaQuery,
  Skeleton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import AdminSidebar from "./AdminSidebar";
import {
  PersonOutline,
  CloudUpload,
  CloudDownload,
  NotificationsOutlined,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { ShoppingCart, AttachMoney } from "@mui/icons-material";
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
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { API_BASE_URL, API_BASE_URL_3} from './config/api.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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
  components: {
    MuiSkeleton: {
      styleOverrides: {
        root: {
          position: "relative",
          overflow: "hidden",
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(90deg, rgba(255, 255, 255, 0) 25%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0) 75%)`,
            animation: "shimmer 1.5s infinite",
            zIndex: 1,
          },
        },
      },
    },
  },
});

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
    
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  .MuiSkeleton-root {
    position: relative;
    overflow: hidden;
    background: #e0e0e0;
  }
`;

const buttonStyles = {
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#FFFFFF",
  backgroundColor: "#8BD3E6",
  border: "1px solid #8BD3E6",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#6FBCCF",
    borderColor: "#6FBCCF",
    boxShadow: "none",
  },
  "&:disabled": {
    backgroundColor: "#E0E0E0",
    borderColor: "#E0E0E0",
    color: "#9E9E9E",
  },
};

export default function AdminDashboard() {
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadsData, setUploadsData] = useState(null);
  const [purchasesData, setPurchasesData] = useState(null);
  const [pendingFeedbackCount, setPendingFeedbackCount] = useState(0);
  const [statsData, setStatsData] = useState([
    {
      title: "Total Customers",
      value: "0",
      icon: (
        <PersonOutline
          sx={{ fontSize: { xs: 30, sm: 40 }, color: "#3B3183" }}
        />
      ),
      button: (
        <Button
          variant="outlined"
          sx={{ mt: 2, width: "100%", ...buttonStyles }}
          onClick={() => navigate("/admin-manage-users")}
        >
          Manage Users
        </Button>
      ),
    },
    {
      title: "Pending Feedbacks",
      value: "0",
      icon: <NotificationsOutlined sx={{ fontSize: 40, color: "#FF5722" }} />,
      button: (
        <Button
          variant="outlined"
          sx={{ mt: 2, width: "100%", ...buttonStyles }}
          onClick={() => navigate("/admin-inbox")}
        >
          Inbox (0)
        </Button>
      ),
    },
    {
      title: "Total Uploads",
      value: "0",
      icon: <CloudUpload sx={{ fontSize: 40, color: "#4CAF50" }} />,
      change: null,
    },
    {
      title: "Total Purchases",
      value: "0",
      icon: <AttachMoney sx={{ fontSize: 40, color: "#FF9800" }} />,
      change: null,
    },
  ]);

  const navigate = useNavigate();
  // Styles object for responsive layout
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
      p: { xs: 0, sm: 3 },
      ml: isLargeScreen ? 1 : 0,
      mt: isLargeScreen ? 2 : 8,
      mb: 3,
      width: "100%",
    },
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    // Frontend component changes
    const fetchDashboardStats = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL_3}/admin/stats`);
        const {
          uploadsByYear,
          purchasesByYear,
          totalUsers,
          totalUploads,
          totalPurchases,
        } = response.data;

        // Get current date info
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        // Calculate current month changes using current year data
        const currentYearUploads =
          uploadsByYear[currentYear] || Array(12).fill(0);
        const currentYearPurchases =
          purchasesByYear[currentYear] || Array(12).fill(0);

        const uploadsChange =
          currentYearUploads[currentMonth] -
          (currentMonth > 0 ? currentYearUploads[currentMonth - 1] : 0);

        const purchasesChange =
          currentYearPurchases[currentMonth] -
          (currentMonth > 0 ? currentYearPurchases[currentMonth - 1] : 0);

        setStatsData((prevStats) => [
          {
            ...prevStats[0],
            value: totalUsers.toString(),
          },
          prevStats[1],
          {
            ...prevStats[2],
            value: totalUploads.toString(),
            change: uploadsChange,
          },
          {
            ...prevStats[3],
            value: totalPurchases.toString(),
            change: purchasesChange,
          },
        ]);

        const labels = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        // Define distinct colors for different years
        const yearColors = {
          2024: {
            upload: { primary: "rgba(135, 206, 250, 0.6)" }, // Light blue
            purchase: {
              border: "rgba(135, 206, 250, 0.6)",
              background: "rgba(135, 206, 250, 0.6)",
            },
          },
          2025: {
            upload: { primary: "rgba(0, 0, 139, 0.6)" }, // Dark blue
            purchase: {
              border: "rgba(0, 0, 139, 0.6)",
              background: "rgba(0, 0, 139, 0.6)",
            },
          },
        };

        // Create datasets for each year
        const years = Object.keys(uploadsByYear).sort();
        const uploadDatasets = years.map((year) => ({
          label: `Uploads ${year}`,
          data: uploadsByYear[year],
          backgroundColor:
            yearColors[year]?.upload.primary || `rgba(201, 203, 207, 0.6)`, // Fallback color
          borderRadius: 6,
        }));

        const purchaseDatasets = years.map((year) => ({
          label: `Purchases ${year}`,
          data: purchasesByYear[year],
          borderColor:
            yearColors[year]?.purchase.border || "rgba(201, 203, 207, 0.8)",
          backgroundColor:
            yearColors[year]?.purchase.background || "rgba(201, 203, 207, 0.2)",
          tension: 0.4,
          fill: true,
        }));

        setUploadsData({
          labels,
          datasets: uploadDatasets,
        });

        setPurchasesData({
          labels,
          datasets: purchaseDatasets,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/current-user`);
        setTimeout(() => {
          setUser(response.data);
          setLoading(false);
        }, 1000); // Artificial delay of 1 second
      } catch (error) {
        console.error("Error fetching current user:", error);
        navigate("/login");
      }
    };

    fetchDashboardStats();
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL_3}/admin/feedbacks`
        );

        // Get both the feedbacks array and the total count
        const { feedbacks, totalFeedbacks } = response.data;
        setPendingFeedbackCount(totalFeedbacks);

        // Update the stats data
        setStatsData((prevStats) => {
          const newStats = [...prevStats];
          newStats[1] = {
            ...newStats[1],
            value: totalFeedbacks.toString(),
            button: (
              <Button
                variant="outlined"
                sx={{ mt: 2, width: "100%", ...buttonStyles }}
                onClick={() => navigate("/admin-inbox")}
              >
                Inbox
              </Button>
            ),
          };
          return newStats;
        });
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };

    fetchFeedbacks();
  }, [navigate]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            family: "Montserrat",
            size: isMobile ? 10 : 12,
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: "#e0e0e0",
        },
        ticks: {
          font: {
            family: "Montserrat",
            size: isMobile ? 10 : 12,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "Montserrat",
            size: isMobile ? 10 : 12,
          },
        },
      },
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
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
              sx={{ color: "#3B3183", fontWeight: "bold" }}
            >
              Dashboard 🚥
            </Typography>

            {/* Mobile user info */}
            {!isLargeScreen && (
              <Box
                sx={{
                  ml: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {!isMobile && (
                  <Typography variant="body2" sx={{ color: "#3B3183" }}>
                    {loading ? (
                      <Skeleton variant="text" width={100} animation="wave" />
                    ) : (
                      user?.username
                    )}
                  </Typography>
                )}
                {loading ? (
                  <Skeleton
                    variant="circular"
                    width={40}
                    height={40}
                    animation="wave"
                  />
                ) : (
                  <Avatar
                    alt={user?.username}
                    src={user?.profile_picture}
                    sx={{ width: 40, height: 40 }}
                  >
                    {(!user || !user.profile_picture) && user
                      ? user.username.charAt(0).toUpperCase()
                      : null}
                  </Avatar>
                )}
              </Box>
            )}
          </Toolbar>
        </AppBar>

        {/* Permanent drawer for large screens */}
        <Drawer variant="permanent" sx={styles.drawer}>
          <AdminSidebar active="dashboard" />
        </Drawer>

        {/* Temporary drawer for smaller screens */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={styles.mobileDrawer}
        >
          <AdminSidebar active="dashboard" />
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={styles.mainContent}>
          {/* Header Section - Desktop */}
          {isLargeScreen && (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: "Montserrat",
                    fontWeight: "bold",
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" },
                  }}
                >
                  Dashboard
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body1">
                    {loading ? "Loading..." : user?.username}
                  </Typography>
                  <Avatar
                    alt={user?.username}
                    src={user?.profile_picture}
                    sx={{ width: 40, height: 40 }}
                  >
                    {(!user || !user.profile_picture) && user
                      ? user.username.charAt(0).toUpperCase()
                      : null}
                  </Avatar>
                </Box>
              </Box>
              <Divider sx={{ mb: 4 }} />
            </>
          )}

          {/* Charts Grid */}
          <Grid
            container
            spacing={{ xs: 2, sm: 3 }}
            sx={{ mt: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}
          >
            {/* First Row - Charts */}
            {[
              {
                title: "Upload Statistics",
                data: uploadsData,
                chart: Bar,
                maxWidth: "520px",
                placeholder: "Loading chart...",
              },
              {
                title: "Purchase Trends",
                data: purchasesData,
                chart: Line,
                maxWidth: "550px",
                placeholder: "Loading chart...",
              },
            ].map((item, index) => (
              <Grid
                item
                xs={12}
                md={6}
                key={index}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <Card
                  elevation={2}
                  sx={{
                    p: { xs: 1, sm: 2 },
                    borderRadius: 4,
                    width: "100%",
                    maxWidth: item.maxWidth,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: "Montserrat",
                        fontWeight: "bold",
                        mb: 2,
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Box sx={{ height: { xs: 250, sm: 300 } }}>
                      {loading ? (
                        <Skeleton
                          variant="rectangular"
                          height="100%"
                          animation="wave"
                        />
                      ) : item.data ? (
                        <item.chart data={item.data} options={chartOptions} />
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "Montserrat",
                            textAlign: "center",
                            mt: 2,
                          }}
                        >
                          {item.placeholder}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {/* Stats Cards */}
            {statsData.map((stat, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={3}
                key={index}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <Card
                  elevation={2}
                  sx={{
                    borderRadius: 4,
                    p: { xs: 1, sm: 2 },
                    width: "100%",
                    maxWidth: { xs: "100%", sm: "300px" },
                  }}
                >
                  <CardContent>
                    {loading ? (
                      <>
                        <Skeleton
                          variant="circular"
                          width={40}
                          height={40}
                          animation="wave"
                        />
                        <Skeleton
                          variant="text"
                          width="70%"
                          height={32}
                          sx={{ mt: 2 }}
                          animation="wave"
                        />
                        <Skeleton
                          variant="text"
                          width="50%"
                          height={24}
                          animation="wave"
                        />
                      </>
                    ) : (
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
                              fontSize: { xs: "1.5rem", sm: "2rem" },
                            }}
                          >
                            {stat.value}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "Montserrat",
                              color: "#757575",
                              fontSize: { xs: "0.875rem", sm: "1rem" },
                            }}
                          >
                            {stat.title}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {stat.change !== undefined && !loading && (
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "Montserrat",
                          color: stat.change >= 0 ? "green" : "red",
                          fontWeight: "bold",
                          mt: 1,
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                        }}
                      >
                        {stat.change >= 0 ? `+${stat.change}` : stat.change}{" "}
                        this month
                      </Typography>
                    )}
                  </CardContent>
                  {stat.button && !loading && (
                    <CardActions>{stat.button}</CardActions>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
