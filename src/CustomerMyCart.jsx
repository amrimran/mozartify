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
  IconButton,
  Button,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CustomerSidebar from "./CustomerSidebar";
import { createGlobalStyle } from "styled-components";
import { useStripe, useElements } from "@stripe/react-stripe-js";

axios.defaults.withCredentials = true;

export default function CustomerMyCart() {
  const [user, setUser] = useState(null);
  const [cartItemIDs, setCartItemIDs] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:3000/current-user");
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching current user:", error);
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

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

  return (
    <>
      <GlobalStyle />
      <Box display="flex">
      <CustomerSidebar active ='cart'/>
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
              <Typography variant="h4">My Cart</Typography>
              <Box ml={2}>
                <Box
                  sx={{
                    minWidth: 50,
                    height: 50,
                    backgroundColor: "#D3D3D3",
                    borderRadius: "50%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "0 10px",
                  }}
                >
                  <Typography variant="h5" sx={{ color: "#4B4B4B" }}>
                    {cartItems.length > 99 ? "99+" : cartItems.length}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              {user ? (
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
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead
                    sx={{ color: "white", backgroundColor: "#67ADC1" }}
                  >
                    <TableRow>
                      <TableCell sx={{ color: "#ffffff" }}>#</TableCell>
                      <TableCell sx={{ color: "#ffffff" }}>Title</TableCell>
                      <TableCell sx={{ color: "#ffffff" }}>Composer</TableCell>
                      <TableCell sx={{ color: "#ffffff" }}>Price</TableCell>
                      <TableCell sx={{ color: "#ffffff" }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cartItems.map((item, index) => (
                      <TableRow
                        key={item._id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>{item.composer}</TableCell>
                        <TableCell>RM {item.price}</TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleRemoveItem(item._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mt={2}
              >
                <Typography variant="h6">
                  Subtotal: RM {subtotal.toFixed(2)}
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleStripeCheckout}
                  sx={{
                    backgroundColor: "#3b1830", // Set background color
                    color: "#ffffff", // Set text color
                    "&:hover": {
                      backgroundColor: "#2e162b", // Darker shade for hover effect
                    },
                  }}
                >
                  Pay
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </>
  );
}
