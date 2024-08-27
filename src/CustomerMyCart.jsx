import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Box, Divider, Typography, Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Button, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomerSidebar from './CustomerSidebar';
import { createGlobalStyle } from "styled-components";

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

  const subtotal = cartItems.length > 0
    ? cartItems.reduce((sum, item) => sum + item.ms_price, 0)
    : 0;

  const handleRemoveItem = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/remove-item-from-cart/${id}`);
      await fetchCartItemIDs(); // Re-fetch cart IDs after removal
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
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
        <CustomerSidebar />
        <Box flex={1} padding={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">My Cart</Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {user ? (
                <>
                  <Typography variant="body1" sx={{ mr: 2 }}>
                    {user.username}
                  </Typography>
                  <Avatar>{user.username.charAt(0)}</Avatar>
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
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Composer</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItems.map((item, index) => (
                  <TableRow key={item._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.ms_title}</TableCell>
                    <TableCell>{item.ms_composer}</TableCell>
                    <TableCell>RM {item.ms_price.toFixed(2)}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleRemoveItem(item._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <Typography variant="h6">Subtotal: ${subtotal.toFixed(2)}</Typography>
            <Button variant="contained" color="primary">Pay</Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}
