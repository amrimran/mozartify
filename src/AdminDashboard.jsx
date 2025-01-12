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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import AdminSidebar from "./AdminSidebar";
import {
  PersonOutline,
  CloudUpload,
  CloudDownload,
  NotificationsOutlined,
} from "@mui/icons-material";
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

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
    overflow-x: hidden;

  }
`;

const buttonStyles = {
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#FFFFFF",
  backgroundColor: "#8BD3E6",
  borderColor: "#8BD3E6",
  "&:hover": {
    backgroundColor: "#FFFFFF",
    color: "#8BD3E6",
    borderColor: "#8BD3E6",
  },
};

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadsData, setUploadsData] = useState(null);
  const [purchasesData, setPurchasesData] = useState(null);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);
  const [statsData, setStatsData] = useState([
    {
      title: "Total Customers",
      value: "0",
      icon: <PersonOutline sx={{ fontSize: 40, color: "#3B3183" }} />,
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
      title: "Inbox Notifications",
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
      icon: <CloudDownload sx={{ fontSize: 40, color: "#FF9800" }} />,
      change: null,
    },
  ]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axios.get("http://localhost:3003/admin/stats");
        const {
          monthlyUploads,
          monthlyPurchases,
          totalUsers,
          totalUploads,
          totalPurchases,
        } = response.data;

        const uploadsChange =
          monthlyUploads[monthlyUploads.length - 1] -
          (monthlyUploads[monthlyUploads.length - 2] || 0);
        
        // Fix: Calculate the actual change between current and previous month
        const currentMonthPurchases = monthlyPurchases[monthlyPurchases.length - 1] || 0;
        const previousMonthPurchases = monthlyPurchases[monthlyPurchases.length - 2] || 0;
        const purchasesChange = currentMonthPurchases - previousMonthPurchases;

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
            change: purchasesChange, // Now using the correct change calculation
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

        setUploadsData({
          labels,
          datasets: [
            {
              label: "Uploads",
              data: monthlyUploads,
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderRadius: 6,
            },
          ],
        });

        setPurchasesData({
          labels,
          datasets: [
            {
              label: "Purchases",
              data: monthlyPurchases,
              borderColor: "rgba(153, 102, 255, 0.6)",
              backgroundColor: "rgba(153, 102, 255, 0.3)",
              tension: 0.4,
              fill: true,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

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

    fetchDashboardStats();
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3003/admin/feedbacks"
        );
        const feedbackCount = response.data.totalFeedbacks;
        setTotalFeedbacks(feedbackCount);

        setStatsData((prevStats) => {
          const newStats = [...prevStats];
          newStats[1] = {
            ...newStats[1],
            value: feedbackCount.toString(),
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
              Dashboard
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="body1"
                sx={{ mr: 2, fontFamily: "Montserrat" }}
              >
                {loading ? "Loading..." : user?.username || "Admin"}
              </Typography>
              <Avatar
                alt={user ? user.username : null}
                src={user && user.profile_picture ? user.profile_picture : null}
              >
                {(!user || !user.profile_picture) && user
                  ? user.username.charAt(0).toUpperCase()
                  : null}
              </Avatar>
            </Box>
          </Box>

          <Divider sx={{ my: 1 }} />

          <Grid
            container
            spacing={3}
            sx={{ mt: 10, maxWidth: "1300px", margin: "0 auto" }}
          >
            {/* First Row */}
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
                sx={{ display: "flex", justifyContent: "center", px: 1 }}
              >
                <Card
                  elevation={2}
                  sx={{
                    p: 2,
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
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      {item.data ? (
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
          </Grid>

          {/* Second Row */}
          <Grid
            container
            spacing={4}
            sx={{ mt: 5, maxWidth: "1200px", margin: "0 auto" }}
          >
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
                    p: 2,
                    width: "100%",
                    maxWidth: "300px",
                    mb: 2,
                  }}
                >
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
                          sx={{ fontFamily: "Montserrat", fontWeight: "bold" }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: "Montserrat", color: "#757575" }}
                        >
                          {stat.title}
                        </Typography>
                      </Box>
                    </Box>
                    {stat.change !== undefined && (
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "Montserrat",
                          color: stat.change >= 0 ? "green" : "red",
                          fontWeight: "bold",
                          mt: 1,
                          textAlign: "left",
                        }}
                      >
                        {stat.change >= 0 ? `+${stat.change}` : stat.change}{" "}
                        this month
                      </Typography>
                    )}
                  </CardContent>
                  {stat.button && <CardActions>{stat.button}</CardActions>}
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ height: "50px" }} />
        </Box>
      </Box>
    </>
  );
}
