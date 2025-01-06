import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
} from "@mui/material";
import CustomerSidebar from "./CustomerSidebar";
import { createGlobalStyle } from "styled-components";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";

export default function CustomerMusicScoreView() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [musicScore, setMusicScore] = useState();
  const [favorites, setFavorites] = useState([]);
  const [addedToCartScores, setAddedToCartScores] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const response = await axios.get("http://localhost:3000/current-user");
        setUser(response.data);
        setFavorites(response.data.favorites);
      } catch (error) {
        console.error("Error fetching the user session:", error);
      }
    };

    const fetchImage = async (imagePath) => {
      try {
        const storageRef = ref(storage, imagePath);
        const url = await getDownloadURL(storageRef);

        return url;
      } catch (error) {
        console.error("Error fetching image:", error);
        return null;
      }
    };

    const fetchMusicScore = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/music-score/${id}`
        );

        const fetchedScore = response.data;
        const imageUrl = await fetchImage(fetchedScore.coverImageUrl);
        const updatedScore = { ...fetchedScore, imageUrl };

        setMusicScore(updatedScore);
      } catch (error) {
        console.error("Error fetching the music score:", error);
      }
    };

    fetchUserSession();
    fetchMusicScore();
  }, [id]);

  useEffect(() => {
    const fetchAddedToCartScores = async () => {
      try {
        const response = await axios.get("http://localhost:3000/user-cart");

        if (response.data.length === 0) {
          setAddedToCartScores([]);
          return;
        }

        const AddedScoreIds = response.data.map((added) => added.score_id);

        setAddedToCartScores(AddedScoreIds);
      } catch (error) {
        console.error("Error fetching user's cart:", error);
        navigate("/login");
      }
    };

    fetchAddedToCartScores();
  }, [navigate]);

  const addToCart = async (scoreId) => {
    try {
      await axios.post("http://localhost:3000/add-to-cart", {
        musicScoreId: scoreId,
      });
      setAddedToCartScores([...addedToCartScores, scoreId]);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const toggleFavorite = async (musicScoreId) => {
    try {
      const response = await axios.post("http://localhost:3000/set-favorites", {
        musicScoreId,
      });
      setFavorites(response.data.favorites);
    } catch (error) {
      console.error("Error updating favorites:", error);
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
      <Box sx={{ display: "flex", maxHeight: "100vh" }}>
        <CustomerSidebar />

        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            padding: 5,
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
              <Typography variant="h4">Music Score View</Typography>
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
                    Loading ...
                  </Typography>
                  <Avatar>L</Avatar>
                </>
              )}
            </Box>
          </Box>
          <Divider sx={{ ml: 2, mb: 2 }} />

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 2,
              justifyContent: "center",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Button
              variant="contained"
              startIcon={<ShoppingCartIcon />}
              onClick={(e) => {
                addToCart(musicScore._id);
              }}
              sx={{
                backgroundColor: "#3b3183",
                color: "#fff", // White text color
                "&:hover": {
                  backgroundColor: "#8B4513", // Darker brown on hover
                },
              }}
            >
              Add to Cart
            </Button>
            <Button
              variant="contained"
              startIcon={<FavoriteIcon />}
              onClick={(e) => {
                toggleFavorite(musicScore._id);
              }}
              sx={{
                backgroundColor: "red",
                color: "#fff", // White text color
                "&:hover": {
                  backgroundColor: "#B22222", // Darker red on hover
                },
              }}
            >
              Add to Favorites
            </Button>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "row", gap: 4 }}>
            <Card
              sx={{
                flexGrow: 1,
                p: 3,
                bgcolor: "#F2F2F5",
                borderRadius: 2,
                width: 150,
                maxHeight: "500px", // Card's fixed height
              }}
            >
              <Box
                sx={{
                  bgcolor: "#FFFFFF",
                  borderRadius: 2,
                  p: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  maxHeight: "100%", // Make Box take up available height within the Card
                  overflowY: "auto", // Enable vertical scrolling inside the Box
                  height: "100%",
                }}
              >
                {musicScore ? (
                  <img
                    src={musicScore.imageUrl}
                    alt="Music Score Cover"
                    style={{
                      width: "80%",
                      borderRadius: "10px",
                      backgroundColor: "#FFFFFF",
                    }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ fontFamily: "Montserrat" }}>
                    Loading music score...
                  </Typography>
                )}
              </Box>
            </Card>

            {musicScore ? (
              <Card
                sx={{
                  width: 200,
                  p: 2,
                  bgcolor: "#F2F2F5",
                  borderRadius: 2,
                  height: "515px",
                  overflowY: "auto",
                  flexGrow: 1,
                }}
              >
                <CardContent
                  sx={{ bgcolor: "#FFFFFF", borderRadius: 2, p: 0, pl: -1 }}
                >
                  <List>
                    {/* Reordered Fields */}
                    <ListItem>
                      <ListItemText
                        primary="Title"
                        secondary={musicScore.title || "N/A"}
                        primaryTypographyProps={{
                          sx: { fontFamily: "Montserrat", fontWeight: "bold" },
                        }}
                        secondaryTypographyProps={{
                          sx: { fontFamily: "Montserrat" },
                        }}
                        sx={{ p: 1 }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Artist"
                        secondary={musicScore.artist || "N/A"}
                        primaryTypographyProps={{
                          sx: { fontFamily: "Montserrat", fontWeight: "bold" },
                        }}
                        secondaryTypographyProps={{
                          sx: { fontFamily: "Montserrat" },
                        }}
                        sx={{ p: 1 }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Composer"
                        secondary={musicScore.composer || "N/A"}
                        primaryTypographyProps={{
                          sx: { fontFamily: "Montserrat", fontWeight: "bold" },
                        }}
                        secondaryTypographyProps={{
                          sx: { fontFamily: "Montserrat" },
                        }}
                        sx={{ p: 1 }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Genre"
                        secondary={musicScore.genre || "N/A"}
                        primaryTypographyProps={{
                          sx: { fontFamily: "Montserrat", fontWeight: "bold" },
                        }}
                        secondaryTypographyProps={{
                          sx: { fontFamily: "Montserrat" },
                        }}
                        sx={{ p: 1 }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Instrumentation"
                        secondary={musicScore.instrumentation || "N/A"}
                        primaryTypographyProps={{
                          sx: { fontFamily: "Montserrat", fontWeight: "bold" },
                        }}
                        secondaryTypographyProps={{
                          sx: { fontFamily: "Montserrat" },
                        }}
                        sx={{ p: 1 }}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemText
                        primary="Emotion"
                        secondary={musicScore.emotion || "N/A"}
                        primaryTypographyProps={{
                          sx: { fontFamily: "Montserrat", fontWeight: "bold" },
                        }}
                        secondaryTypographyProps={{
                          sx: { fontFamily: "Montserrat" },
                        }}
                        sx={{ p: 1 }}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemText
                        primary="Description"
                        secondary={musicScore.desc || "N/A"}
                        primaryTypographyProps={{
                          sx: { fontFamily: "Montserrat", fontWeight: "bold" },
                        }}
                        secondaryTypographyProps={{
                          sx: { fontFamily: "Montserrat" },
                        }}
                        sx={{ p: 1 }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            ) : (
              <Typography variant="body2" sx={{ fontFamily: "Montserrat" }}>
                Loading metadata...
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}
