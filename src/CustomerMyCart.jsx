import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Divider,
  Typography,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Paper,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Drawer,
  Container,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";
import PaymentIcon from "@mui/icons-material/Payment";
import CustomerSidebar from "./CustomerSidebar";
import { createGlobalStyle } from "styled-components";
import { useStripe, useElements } from "@stripe/react-stripe-js";

axios.defaults.withCredentials = true;
import { API_BASE_URL} from './config/api.js';

const DRAWER_WIDTH = 230;

export default function CustomerMyCart() {
  const [user, setUser] = useState(null);

  //cart variables
  const [cartItemIDs, setCartItemIDs] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  //page variables
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(3);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [fadeIn, setFadeIn] = useState(false);
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
        xs: 0, // mobile phones
        sm: 600, // tablets
        md: 960, // small laptops
        lg: 1280, // desktops
        xl: 1920, // large screens
      },
    },
  });

  // Media query hooks
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const styles = {
    root: {
      display: "flex",
      backgroundColor: "#FFFFFF",
      minHeight: "100vh",
      margin: 0, // Added this to remove margin
      padding: 0, // Added this to remove padding
      width: "100vw", // Ensures full width
      overflowX: "auto", // Prevent horizontal scrollbars
    },
    appBar: {
      display: isLargeScreen ? "none" : "block",
      backgroundColor: "#FFFFFF",
      boxShadow: "none",
      borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
      // width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
      // ml: { sm: `${DRAWER_WIDTH}px` },
    },
    drawer: {
      width: DRAWER_WIDTH,
      flexShrink: 0,
      display: isLargeScreen ? "block" : "none",
      "& .MuiDrawer-paper": {
        // width: DRAWER_WIDTH,
        boxSizing: "border-box",
        minHeight: "100vh",
      },
      minHeight: "100vh",
    },
    mobileDrawer: {
      display: isLargeScreen ? "none" : "block",
      "& .MuiDrawer-paper": {
        // width: DRAWER_WIDTH,
        boxSizing: "border-box",
        minHeight: "100vh",
      },
      minHeight: "100vh",
    },
    mainContent: {
      flexGrow: 1,
      p: 3,
      // width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
      // ml: { sm: `${DRAWER_WIDTH}px` },
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
      // px: isMobile ? 2 : 3,
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

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedItems = [...cartItems].sort((a, b) => {
      if (key === "price") {
        return direction === "asc"
          ? parseFloat(a[key]) - parseFloat(b[key])
          : parseFloat(b[key]) - parseFloat(a[key]);
      }
      return direction === "asc"
        ? a[key].localeCompare(b[key])
        : b[key].localeCompare(a[key]);
    });
    setCartItems(sortedItems);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setFadeIn(false);
      try {
        const response = await axios.get(`${API_BASE_URL}/current-user`);
        setTimeout(() => {
          setUser(response.data);
          setLoading(false);
          // Add a small delay before triggering fade in
          setTimeout(() => {
            setFadeIn(true);
          }, 100);
        }, 1000);
      } catch (error) {
        console.error("Error fetching current user:", error);
        setLoading(false);
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  const fetchCartItemIDs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user-cart`);
      if (response.data.length === 0) {
        setCartItemIDs([]);
        return;
      }
      const CartScoreIds = response.data.map((items) => items.score_id);
      setCartItemIDs(CartScoreIds);
    } catch (error) {
      console.error("Error fetching user's cart:", error);
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchCartItemIDs();
  }, []);

  const fetchCartItems = async () => {
    try {
      console.log("Cart Items: " + cartItemIDs.length);
      if (cartItemIDs.length > 0) {
        const detailsPromises = cartItemIDs.map((scoreId) =>
          axios.get(`${API_BASE_URL}/music-score/${scoreId}`)
        );
        const detailsResponses = await Promise.all(detailsPromises);
        const cartScores = detailsResponses.map((response) => response.data);
        setCartItems(cartScores);
      } else {
        setCartItems([]); // Clear the cart items if no IDs
      }
    } catch (error) {
      console.error("Error fetching user's cart items:", error);
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [cartItemIDs]);

  const subtotal =
    cartItems.length > 0
      ? cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0)
      : 0;

  const handleRemoveItem = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/remove-item-from-cart/${id}`);
      await fetchCartItemIDs();
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  const buttonStyles = {
    px: 6,
    py: 1,
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
    "& .MuiButton-startIcon": {
      "& > *:first-of-type": {
        fontSize: "2rem",
      },
    },
  };

  const SortableTableHeader = ({ label, field }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Typography sx={{ fontWeight: 700, color: "#ffffff" }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography
          onClick={() => requestSort(field)}
          sx={{
            cursor: "pointer",
            color:
              sortConfig.key === field && sortConfig.direction === "asc"
                ? "#ffffff"
                : "rgba(255,255,255,0.5)",
            fontSize: "14px",
            mr: 0.5,
          }}
        >
          {field === "price" ? "1↑" : "A↑"}
        </Typography>
        <Typography
          onClick={() => requestSort(field)}
          sx={{
            cursor: "pointer",
            color:
              sortConfig.key === field && sortConfig.direction === "desc"
                ? "#ffffff"
                : "rgba(255,255,255,0.5)",
            fontSize: "14px",
          }}
        >
          {field === "price" ? "9↓" : "Z↓"}
        </Typography>
      </Box>
    </Box>
  );

  const stripe = useStripe();
  const elements = useElements();

  const handleStripeCheckout = async () => {
    if (!stripe || !elements) {
      return;
    }

    const response = await axios.post(
      `${API_BASE_URL}/create-checkout-session`,
      {
        cartItems,
      }
    );

    const { id } = response.data;

    const { error } = await stripe.redirectToCheckout({ sessionId: id });

    if (error) {
      console.error("Stripe checkout error:", error);
    }

    console.log("Subtotal:", subtotal);
    console.log("Data type of subtotal:", typeof subtotal);
  };

  const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
`;

  const currentItems = cartItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
                My Cart
              </Typography>
            </Box>

            {/* User info section */}
            {!isLargeScreen && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="body1"
                  sx={{
                    mr: 2,
                    color: "#3B3183",
                    display: { xs: "none", sm: "block" }, // Hide username on very small screens
                  }}
                >
                  {user?.username}
                </Typography>
                <Avatar
                  alt={user?.username}
                  src={user?.profile_picture}
                  sx={{
                    width: 32,
                    height: 32,
                    border: "2px solid #3B3183",
                  }}
                >
                  {user?.username.charAt(0).toUpperCase()}
                </Avatar>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        {/* Permanent drawer for large screens */}
        <Drawer variant="permanent" sx={styles.drawer} open>
          <CustomerSidebar active="cart" />
        </Drawer>

        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={styles.mobileDrawer}
        >
          <CustomerSidebar active="cart" />
        </Drawer>

        {/* Main content */}
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
                My Cart
              </Typography>
            )}

            {isLargeScreen && (
              <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  {user?.username}
                </Typography>
                <Avatar
                  alt={user?.username}
                  src={user?.profile_picture}
                  sx={{ width: 40, height: 40 }}
                >
                  {user?.username.charAt(0).toUpperCase()}
                </Avatar>
              </Box>
            )}
          </Box>

          {isLargeScreen && <Divider sx={{ mb: 4 }} />}

          <Container sx={styles.contentContainer}>
            {/* Cart Content */}

            {cartItems.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center">
                <Typography variant="h6" color="textSecondary">
                  No music scores are added in the cart for now.
                </Typography>
              </Box>
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
              >
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
                  <Table>
                    <TableHead sx={{ backgroundColor: "#8BD3E6" }}>
                      <TableRow>
                        <TableCell
                          sx={{ color: "#ffffff", p: isMobile ? 1 : 2 }}
                        >
                          #
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ffffff", p: isMobile ? 1 : 2 }}
                        >
                          Title
                        </TableCell>
                        {!isMobile && (
                          <>
                            <TableCell sx={{ color: "#ffffff", p: 2 }}>
                              Composer
                            </TableCell>
                            <TableCell sx={{ color: "#ffffff", p: 2 }}>
                              Genre
                            </TableCell>
                          </>
                        )}
                        <TableCell
                          sx={{ color: "#ffffff", p: isMobile ? 1 : 2 }}
                        >
                          Price
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ffffff", p: isMobile ? 1 : 2 }}
                        >
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentItems.map((item, index) => (
                        <TableRow
                          key={item._id}
                          sx={{
                            opacity: fadeIn ? 1 : 0,
                            transition: "opacity 0.5s ease-in-out",
                          }}
                        >
                          <TableCell sx={{ p: isMobile ? 1 : 2 }}>
                            {page * rowsPerPage + index + 1}
                          </TableCell>
                          <TableCell
                            sx={{
                              p: isMobile ? 1 : 2,
                              maxWidth: isMobile ? "120px" : "250px",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <img
                                src={item?.coverImageUrl}
                                alt={" N/A"}
                                style={{
                                  width: isMobile ? "50px" : "90px",
                                  height: "auto",
                                  maxHeight: isMobile ? "40px" : "70px",
                                  objectFit: "contain",
                                }}
                              />
                              <Typography
                                sx={{
                                  ml: 1,
                                  fontWeight: 700,
                                  fontSize: isMobile ? "0.8rem" : "1rem",
                                }}
                              >
                                {item?.title}
                              </Typography>
                            </Box>
                          </TableCell>
                          {!isMobile && (
                            <>
                              <TableCell sx={{ p: 2 }}>
                                {item.composer}
                              </TableCell>
                              <TableCell sx={{ p: 2 }}>{item.genre}</TableCell>
                            </>
                          )}
                          <TableCell
                            sx={{
                              p: isMobile ? 1 : 2,
                              fontWeight: 700,
                              color: "green",
                            }}
                          >
                            RM {parseFloat(item.price).toFixed(2)}
                          </TableCell>
                          <TableCell sx={{ p: isMobile ? 1 : 2 }}>
                            <IconButton
                              onClick={() => handleRemoveItem(item._id)}
                              sx={{ color: "#DB2226" }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[3]}
                    component="div"
                    count={cartItems.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                  />
                </TableContainer>

                {/* Subtotal and Payment Section */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    justifyContent: "flex-end",
                    alignItems: isMobile ? "stretch" : "center",
                    gap: 2,
                    mt: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      width: isMobile ? "100%" : "auto",
                      textAlign: isMobile ? "center" : "left",
                    }}
                  >
                    Subtotal:{" "}
                    <span
                      style={{
                        fontWeight: 700,
                        color: "green",
                        textDecoration: "underline",
                      }}
                    >
                      RM {subtotal.toFixed(2)}
                    </span>
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleStripeCheckout}
                    startIcon={<PaymentIcon />}
                    sx={styles.button}
                  >
                    Pay
                  </Button>
                </Box>
              </Box>
            )}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
