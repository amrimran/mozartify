import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  List,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  ListItemButton,
  IconButton,
  InputBase,
  Paper,
  Button,
  Drawer,
  FormControl,
  InputLabel,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";
import {
  FavoriteBorder,
  PlayArrow,
  Favorite,
  FilterAlt,
} from "@mui/icons-material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import CustomerSidebar from "./CustomerSidebar";

axios.defaults.withCredentials = true;

const options = {
  keys: [
    "title",
    "genre",
    "composer",
    "artist",
    "instrumentation",
    "emotion",
  ],
  threshold: 0.3,
};

export default function CustomerFavorites() {
  const [user, setUser] = useState(null);

  const [currentScores, setCurrentScores] = useState([]);
  const [unfilteredScores, setUnfilteredScores] = useState([]);
  const [purchasedScores, setPurchasedScores] = useState([]);
  const [addedToCartScores, setAddedToCartScores] = useState([]);
  const [searchedScores, setSearchedScores] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [genre, setGenre] = useState("");
  const [composer, setComposer] = useState("");
  const [instrumentation, setInstrumentation] = useState("");
  const [emotion, setEmotion] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:3000/current-user");
        setUser(response.data);
        setFavorites(response.data.favorites);
      } catch (error) {
        console.error("Error fetching current user:", error);
        navigate("/login");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchFavoriteScores = async () => {
      try {
        const likedScores = await axios.get(
          "http://localhost:3000/user-liked-scores"
        );

        if (likedScores.data.length > 0) {
          setUnfilteredScores(likedScores.data);
          setCurrentScores(likedScores.data);
        } else {
          setUnfilteredScores([]);
        }
      } catch (error) {
        console.error("Error fetching favorite scores:", error);
      }
    };

    fetchFavoriteScores();
  }, []);

  useEffect(() => {
    const fetchPurchasedScores = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/user-purchases"
        );

        const purchasedScoreIds = response.data.map(
          (purchase) => purchase.score_id
        );

        setPurchasedScores(purchasedScoreIds);
      } catch (error) {
        console.error("Error fetching user's purchased scores:", error);
        navigate("/login");
      }
    };
    fetchPurchasedScores();
  }, []);

  useEffect(() => {
    const fetchAddedToCartScores = async () => {
      try {
        const response = await axios.get("http://localhost:3000/user-cart");

        const AddedScoreIds = response.data.map((added) => added.score_id);

        setAddedToCartScores(AddedScoreIds);
      } catch (error) {
        console.error("Error fetching user's cart:", error);
        navigate("/login");
      }
    };
    fetchAddedToCartScores();
  }, []);

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

  useEffect(() => {
    if (searchQuery) {
      const searchResult = unfilteredScores.filter((score) =>
        [
          score.title,
          score.genre,
          score.emotion,
          score.composer,
          score.artist,
          score.instrumentation,
        ].some((field) =>
          field.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setSearchedScores(searchResult);
      setCurrentScores(searchResult);
    } else {
      setCurrentScores(unfilteredScores);
    }
  }, [searchQuery]);

  const applyFilters = (scores) => {
    return scores.filter((score) => {
      return (
        (!genre || score.genre === genre) &&
        (!composer ||
          score.composer.toLowerCase().includes(composer.toLowerCase())) &&
        (!emotion ||
          score.emotion.toLowerCase().includes(composer.toLowerCase())) &&
        (!instrumentation ||
          score.instrumentation
            .toLowerCase()
            .includes(instrumentation.toLowerCase()))
      );
    });
  };

  const clearFilters = () => {
    setGenre("");
    setComposer("");
    setEmotion("");
    setInstrumentation("");
    setIsFiltered(false);
    setCurrentScores(unfilteredScores);
  };

  const handleFilterRequest = async () => {
    const hasFilter = genre || composer || instrumentation || emotion;

    if (hasFilter) {
      setIsFiltered(true);

      try {
        if (!searchQuery) {
          const filteredOnlySearchResults = applyFilters(unfilteredScores);
          setCurrentScores(filteredOnlySearchResults);
        } else {
          const filteredSearchedSearchResults = applyFilters(searchedScores);
          setCurrentScores(filteredSearchedSearchResults);
        }
      } catch (error) {
        console.error("Error fetching filtered scores:", error);
      }
    } else {
      setIsFiltered(false);
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
      <Box sx={{ display: "flex", height: "100vh" }}>
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
              mt:3
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Paper
                component="form"
                sx={{
                  p: "6px 10px",
                  display: "flex",
                  alignItems: "center",
                  width: 600,
                  border: "1px solid #c44131",
                  borderRadius: "50px",
                }}
              >
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Look for your liked music scores here..."
                  inputProps={{ "aria-label": "search music scores" }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Paper>
              <IconButton
                sx={{ p: "10px", ml: 2}}
                aria-label="filter"
                onClick={() => setIsDrawerOpen(true)}
              >
                <FilterAlt sx={{ color: "#483C32" }} />
              </IconButton>

              <Drawer
                anchor="right"
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
              >
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    p: 2,
                    width: 300,
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Filter Options
                  </Typography>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Genre</InputLabel>
                    <Select
                      label="Genre"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="Classical">Classical</MenuItem>
                      <MenuItem value="Jazz">Jazz</MenuItem>
                      <MenuItem value="Pop">Pop</MenuItem>
                      <MenuItem value="Ragtime">Ragtime</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Composer Filter */}
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Composer</InputLabel>
                    <Select
                      label="Composer"
                      value={composer}
                      onChange={(e) => setComposer(e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="Mozart">Mozart</MenuItem>
                      <MenuItem value="Beethoven">Beethoven</MenuItem>
                      <MenuItem value="Gershwin">Gershwin</MenuItem>
                      <MenuItem value="Chopin">Chopin</MenuItem>
                      <MenuItem value="Debussy">Debussy</MenuItem>
                      <MenuItem value="Scott Joplin">Scott Joplin</MenuItem>
                      <MenuItem value="Erik Satie">Erik Satie</MenuItem>
                      <MenuItem value="Vivaldi">Vivaldi</MenuItem>
                      <MenuItem value="Pacheibel">Pacheibel</MenuItem>
                      <MenuItem value="Ravel">Ravel</MenuItem>
                      <MenuItem value="Liszt">Liszt</MenuItem>
                      <MenuItem value="Rimsky-Korsakov">
                        Rimsky-Korsakov
                      </MenuItem>
                      <MenuItem value="Tchaikovsky">Tchaikovsky</MenuItem>
                      <MenuItem value="Holst">Holst</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Emotion</InputLabel>
                    <Select
                      label="Emotion"
                      value={emotion}
                      onChange={(e) => setEmotion(e.target.value)}
                    >
                      <MenuItem value="All">All</MenuItem>
                      <MenuItem value="Happy">Happy</MenuItem>
                      <MenuItem value="Relaxed">Relaxed</MenuItem>
                      <MenuItem value="Melancholic">Melancholic</MenuItem>
                      <MenuItem value="Peaceful">Peaceful</MenuItem>
                      <MenuItem value="Energetic">Energetic</MenuItem>
                      <MenuItem value="Joyful">Joyful</MenuItem>
                      <MenuItem value="Majestic">Majestic</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Instrumentation"
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 2 }}
                    value={instrumentation}
                    onChange={(e) => setInstrumentation(e.target.value)}
                  />

                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                      mt: 2,
                      borderColor: "#3B3183",
                      color: "#3B3183",
                      "&:hover": {
                        borderColor: "#3B3183",
                        color: "#FFFFFF",
                        backgroundColor: "#3B3183",
                      },
                    }}
                    onClick={handleFilterRequest}
                  >
                    APPLY FILTERS
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                      mt: 2,
                      borderColor: "#C44131",
                      color: "#C44131",
                      "&:hover": {
                        borderColor: "#C44131",
                        color: "#FFFFFF",
                        backgroundColor: "#C44131",
                      },
                    }}
                    onClick={clearFilters}
                  >
                    CLEAR FILTERS
                  </Button>
                </Box>

                <Box sx={{ mt: "auto", p: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      mb: 2, // Margin at the bottom
                      backgroundColor: "#483C32",
                      color: "#fff",
                      "&:hover": {
                        backgroundColor: "#3c312a",
                      },
                    }}
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    CLOSE FILTERS
                  </Button>
                </Box>
              </Drawer>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center"}}>
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

          <Box display="flex" alignItems="center">
            <Typography variant="h4">Favorites</Typography>
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
                  {currentScores.length > 99 ? "99+" : currentScores.length}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
            <List>
              {currentScores.map((item) => (
                <ListItemButton
                  key={item._id}
                  sx={{ display: "flex", alignItems: "center" }}
                  onClick={() =>
                    navigate(
                      `/customer-favorites/customer-music-score-view/${item._id}`
                    )
                  }
                >
                  <ListItemText
                    primary={item.title}
                    secondary={`Genre: ${item.genre} | Composer: ${item.composer} | Artist: ${item.artist}`}
                  />

                  <ListItemIcon>
                    {!purchasedScores.includes(item._id) &&
                      !addedToCartScores.includes(item._id) && (
                        <IconButton onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item._id);}}>
                          <ShoppingCartIcon />
                        </IconButton>
                      )}
                  </ListItemIcon>

                  <ListItemIcon>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item._id);
                      }}
                    >
                      <Favorite
                        color={
                          favorites.includes(item._id) ? "error" : "disabled"
                        }
                      />
                    </IconButton>
                  </ListItemIcon>
                  <ListItemIcon>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <PlayArrow />
                    </IconButton>
                  </ListItemIcon>
                </ListItemButton>
              ))}
            </List>
          </Box>
        </Box>
      </Box>
    </>
  );
}
