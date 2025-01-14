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
  Skeleton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CustomerSidebar from "./CustomerSidebar";
import { createGlobalStyle } from "styled-components";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import PaymentIcon from "@mui/icons-material/Payment";

axios.defaults.withCredentials = true;

export default function CustomerMyCart() {
  const [user, setUser] = useState(null);
  const [cartItemIDs, setCartItemIDs] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(3);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [fadeIn, setFadeIn] = useState(false);

  const theme = createTheme({
    typography: {
      fontFamily: "Montserrat, sans-serif",
      h4: {
        fontWeight: 700,
      },
      h5: {
        fontWeight: 500,
      },
      h6: {
        fontWeight: 500,
      },
      body1: {
        fontWeight: 400,
      },
    },
    components: {
      MuiTableCell: {
        styleOverrides: {
          root: {
            fontFamily: "Montserrat, sans-serif",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 500,
          },
        },
      },
    },
  });

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

  const fetchCartItemIDs = async () => {
    try {
      const response = await axios.get("http://localhost:3000/user-cart");
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
      if (cartItemIDs.length > 0) {
        const detailsPromises = cartItemIDs.map((scoreId) =>
          axios.get(`http://localhost:3000/music-score/${scoreId}`)
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
      await axios.delete(`http://localhost:3000/remove-item-from-cart/${id}`);
      await fetchCartItemIDs();
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setFadeIn(false);
      try {
        const response = await axios.get("http://localhost:3000/current-user");
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
      "http://localhost:3000/create-checkout-session",
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
      <GlobalStyle />
      <Box display="flex">
        <CustomerSidebar active="cart" />
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            padding: 5,
            marginLeft: "229px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              mt: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                My Cart 🛒
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              {loading ? (
                <>
                  <Skeleton variant="text" width={100} sx={{ mr: 2 }} />
                  <Skeleton variant="circular" width={40} height={40} />
                </>
              ) : user ? (
                <>
                  <Typography variant="body1" sx={{ mr: 2 }}>
                    {user.username}
                  </Typography>
                  <Avatar
                    alt={user.username}
                    src={
                      user && user.profile_picture ? user.profile_picture : null
                    }
                  >
                    {(!user || !user.profile_picture) &&
                      user.username.charAt(0).toUpperCase()}
                  </Avatar>
                </>
              ) : (
                <>
                  <Typography variant="body1" sx={{ mr: 2 }}>
                    Loading...
                  </Typography>
                  <Avatar></Avatar>
                </>
              )}
            </Box>
          </Box>
          <Divider />
          {cartItems.length === 0 ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="300px"
            >
              <Typography variant="h6" color="textSecondary">
                No music scores are added in the cart for now.
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer
                component={Paper}
                sx={{
                  mt: 2,
                  "& .MuiTable-root": {
                    borderCollapse: "collapse",
                  },
                  "& .MuiTableCell-root": {
                    borderBottom: "1px solid rgba(224, 224, 224, 1)",
                    padding: "16px",
                  },
                  "& .MuiTableRow-root": {
                    "&:last-child .MuiTableCell-root": {
                      borderBottom: "none",
                    },
                  },
                }}
              >
                <Table>
                  <TableHead
                    sx={{
                      backgroundColor: "#8BD3E6",
                      "& .MuiTableCell-root": {
                        borderBottom: "none",
                      },
                    }}
                  >
                    <TableRow>
                      <TableCell sx={{ width: "60px", color: "#ffffff", p: 2 }}>
                        <Typography sx={{ fontWeight: 700, color: "#ffffff" }}>
                          #
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ width: "400px", p: 2 }}>
                        <SortableTableHeader label="Title" field="title" />
                      </TableCell>
                      <TableCell sx={{ width: "200px", p: 2 }}>
                        <SortableTableHeader
                          label="Composer"
                          field="composer"
                        />
                      </TableCell>
                      <TableCell sx={{ width: "150px", p: 2 }}>
                        <SortableTableHeader label="Genre" field="genre" />
                      </TableCell>
                      <TableCell sx={{ width: "120px", p: 2 }}>
                        <SortableTableHeader label="Price" field="price" />
                      </TableCell>
                      <TableCell sx={{ width: "100px", p: 2 }}>
                        <Typography sx={{ fontWeight: 700, color: "#ffffff" }}>
                          Action
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading
                      ? // Skeleton loading rows
                        [...Array(3)].map((_, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Skeleton />
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Skeleton
                                  variant="rectangular"
                                  width={100}
                                  height={60}
                                />
                                <Skeleton width={150} sx={{ ml: 2 }} />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Skeleton />
                            </TableCell>
                            <TableCell>
                              <Skeleton />
                            </TableCell>
                            <TableCell>
                              <Skeleton />
                            </TableCell>
                            <TableCell>
                              <Skeleton width={40} />
                            </TableCell>
                          </TableRow>
                        ))
                      : currentItems.map((item, index) => (
                          <TableRow
                            key={item._id}
                            sx={{
                              opacity: 0,
                              animation:
                                "fadeInFromLeft 1.0s ease-in-out forwards",
                              "@keyframes fadeInFromLeft": {
                                "0%": {
                                  opacity: 0,
                                  transform: "translateX(-10px)", // Start from the left
                                },
                                "100%": {
                                  opacity: 1,
                                  transform: "translateX(0)", // End at its original position
                                },
                              },
                            }}
                          >
                            <TableCell sx={{ width: "60px", p: 2 }}>
                              {page * rowsPerPage + index + 1}
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "400px",
                                display: "flex",
                                alignItems: "center",
                                p: 2,
                              }}
                            >
                              <img
                                src={item.coverImageUrl}
                                alt={item.title}
                                style={{
                                  width: "90px",
                                  height: "auto",
                                  maxHeight: "70px",
                                  objectFit: "contain",
                                }}
                              />
                              <Box
                                ml={2}
                                sx={{
                                  fontWeight: 700,
                                  color: "black",
                                  maxWidth: "250px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {item.title}
                              </Box>
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "200px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                p: 2,
                              }}
                            >
                              {item.composer}
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "150px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                p: 2,
                              }}
                            >
                              {item.genre}
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "120px",
                                fontWeight: 700,
                                color: "green",
                                p: 2,
                              }}
                            >
                              RM {parseFloat(item.price).toFixed(2)}
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "100px",
                                p: 2,
                              }}
                            >
                              <IconButton
                                onClick={() => handleRemoveItem(item._id)}
                                sx={{
                                  color: "red",
                                  "&:hover": { color: "#d32f2f" },
                                }}
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
                  sx={{
                    ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                      {
                        margin: 0,
                      },
                  }}
                />
              </TableContainer>
              <Box
                display="flex"
                justifyContent="flex-end"
                alignItems="center"
                gap={2}
                mt={2}
              >
                <Typography variant="h6">Subtotal: </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "green",
                    textDecoration: "underline",
                  }}
                >
                  RM {subtotal.toFixed(2)}
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleStripeCheckout}
                  startIcon={<PaymentIcon />}
                  sx={{
                    ...buttonStyles,
                  }}
                >
                  Pay
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
