import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Avatar,
  Typography,
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
  Card,
  CardContent,
  CardMedia,
  Grid,
} from "@mui/material";
import Favorite from "@mui/icons-material/Favorite";
import { PlayArrow, FilterAlt } from "@mui/icons-material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link, useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import CustomerSidebar from "./CustomerSidebar";

axios.defaults.withCredentials = true;

export default function CustomerHomepage() {
  const [user, setUser] = useState(null);

  const [unfilteredSearchedScores, setUnfilteredSearchedScores] = useState([]);
  const [purchasedScores, setPurchasedScores] = useState([]);
  const [addedToCartScores, setAddedToCartScores] = useState([]);
  const [searchedScores, setSearchedScores] = useState([]);
  const [filteredScores, setFilteredScores] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);

  const [popularScores, setPopularScores] = useState([]);
  const [recommendedScores, setRecommendations] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState([]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [genre, setGenre] = useState("");
  const [composer, setComposer] = useState("");
  const [instrumentation, setInstrumentation] = useState("");
  const [emotion, setEmotion] = useState("");

  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const scrollContainerRef2 = useRef(null);

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

  useEffect(() => {
    if (searchQuery) {
      const fetchSearchedScores = async () => {
        try {
          const response = await axios.get(
            "http://localhost:3000/search-music-scores",
            {
              params: { query: searchQuery },
            }
          );
          setUnfilteredSearchedScores(response.data);
          setSearchedScores(response.data);
        } catch (error) {
          console.error("Error fetching searched scores:", error);
        }
      };

      fetchSearchedScores();
    } else {
      setUnfilteredSearchedScores([]);
      setSearchedScores([]);
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
    setSearchedScores(unfilteredSearchedScores);
  };

  const handleFilterRequest = async () => {
    const hasFilter = genre || composer || instrumentation || emotion;

    if (hasFilter) {
      setIsFiltered(true);

      try {
        if (!searchQuery) {
          const response = await axios.get(
            "http://localhost:3000/filter-music-scores",
            {
              params: { genre, composer, instrumentation, emotion },
            }
          );
          setFilteredScores(response.data);
        } else {
          const filteredSearchResults = applyFilters(searchedScores);
          setSearchedScores(filteredSearchResults);
        }
      } catch (error) {
        console.error("Error fetching filtered scores:", error);
      }
    } else {
      setIsFiltered(false);
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:3000/popular-music-scores")
      .then((response) => {
        setPopularScores(response.data);
      })
      .catch((error) => {
        console.error("Error fetching popular scores: ", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:3000/recommendations")
      .then((response) => {
        setRecommendations(response.data);
      })
      .catch((error) => {
        console.error("Error fetching recommended scores: ", error);
      });
  }, []);

  useEffect(() => {
    const fetchPopularImagePaths = async () => {
      const updatedPopularScores = await Promise.all(
        popularScores.map(async (score) => {
          const imageUrl = await fetchImage(score.coverImageUrl);
          return { ...score, imageUrl };
        })
      );
      setPopularScores(updatedPopularScores);
    };

    if (popularScores.length > 0) {
      fetchPopularImagePaths();
    }
  }, [popularScores]);

  useEffect(() => {
    const fetchRecommendedImagePaths = async () => {
      const updatedRecommendedScores = await Promise.all(
        recommendedScores.map(async (score) => {
          const imageUrl = await fetchImage(score.coverImageUrl);
          return { ...score, imageUrl };
        })
      );
      setRecommendations(updatedRecommendedScores);
    };

    if (recommendedScores.length > 0) {
      fetchRecommendedImagePaths();
    }
  }, [recommendedScores]);

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
        <Box sx={{ display: "flex", height: "100vh" }}>
          <CustomerSidebar />
        </Box>

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
                  placeholder="Look for all music scores here..."
                  inputProps={{ "aria-label": "search music scores" }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Paper>
              <IconButton
                sx={{ p: "10px", ml: 2 }}
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
                  <Box>
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
                        {[
                          "All",
                          "Baroque",
                          "Children's",
                          "Children's Song",
                          "Classical",
                          "Disco",
                          "Impressionist",
                          "Pop",
                          "Rock",
                          "Renaissance Polyphony",
                        ].map((item) => (
                          <MenuItem key={item} value={item}>
                            {item}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Composer</InputLabel>
                      <Select
                        label="Composer"
                        value={composer}
                        onChange={(e) => setComposer(e.target.value)}
                      >
                        {[
                          "All",
                          "Antonio Vivaldi",
                          "Claude Debussy",
                          "Emil Aarestrup",
                          "Heinrich Faber",
                          "Johann Pachelbel",
                          "John Lennon, Paul McCartney",
                          "Ludwig van Beethoven",
                          "Mark Fisher",
                          "Joe Goodman",
                          "Larry Shay",
                          "Wolfgang Amadeus Mozart",
                        ].map((composerName) => (
                          <MenuItem key={composerName} value={composerName}>
                            {composerName}
                          </MenuItem>
                        ))}
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
                        <MenuItem value="Happy">Angry</MenuItem>
                        <MenuItem value="Happy">Happy</MenuItem>
                        <MenuItem value="Relaxed">Relaxed</MenuItem>
                        <MenuItem value="Sad">Sad</MenuItem>
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

                  <Box sx={{ mt: "auto" }}>
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
                </Box>
              </Drawer>
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

          <Box display="flex" alignItems="center" mb={2} ml={2}>
            <Typography variant="h4">
              {searchQuery || isFiltered ? "Search Result" : "Dashboard"}
            </Typography>
            {(searchedScores.length > 0 ||
              (searchedScores.length == 0 && searchQuery)) && (
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
                    {searchedScores.length > 99 ? "99+" : searchedScores.length}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {searchQuery ? (
            <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
              {searchedScores.length > 0 ? (
                <List>
                  {searchedScores.map((score) => (
                    <ListItemButton
                      key={score._id}
                      sx={{ display: "flex", alignItems: "center" }}
                      onClick={() =>
                        navigate(
                          `/customer-library/customer-music-score-view/${score._id}`
                        )
                      }
                    >
                      <ListItemText
                        primary={score.title}
                        secondary={`Genre: ${score.genre} | Composer: ${score.composer} | Artist: ${score.artist} | Emotion: ${score.emotion}`}
                      />

                      <ListItemIcon>
                        {!purchasedScores.includes(score._id) &&
                          !addedToCartScores.includes(score._id) && (
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(score._id);
                              }}
                            >
                              <ShoppingCartIcon />
                            </IconButton>
                          )}
                      </ListItemIcon>

                      <ListItemIcon>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(score._id);
                          }}
                        >
                          <Favorite
                            color={
                              favorites.includes(score._id)
                                ? "error"
                                : "disabled"
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
              ) : (
                <Typography variant="body2">No results found</Typography>
              )}
            </Box>
          ) : isFiltered ? (
            <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
              {filteredScores.length > 0 ? (
                <List>
                  {filteredScores.map((score) => (
                    <ListItemButton
                      key={score._id}
                      sx={{ display: "flex", alignItems: "center" }}
                      onClick={() =>
                        navigate(
                          `/customer-library/customer-music-score-view/${score._id}`
                        )
                      }
                    >
                      <ListItemText
                        primary={score.title}
                        secondary={`Genre: ${score.genre} | Composer: ${score.composer} | Artist: ${score.artist} | Emotion: ${score.emotion}`}
                      />

                      <ListItemIcon>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(score._id);
                          }}
                        >
                          <Favorite
                            color={
                              favorites.includes(score._id)
                                ? "error"
                                : "disabled"
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
              ) : (
                <Typography variant="body2">No results found</Typography>
              )}
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  height: "calc(70vh)",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Grid container spacing={4}>
                  {/* Left Box - Popular Scores */}
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{
                        ml: 3,
                        position: "sticky",
                        top: 0,
                        backgroundColor: "#fff",
                        zIndex: 1,
                      }}
                    >
                      Popular
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        ref={scrollContainerRef}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)", // Creates a 3x3 grid
                          gap: "15px", // Increased the gap to 15px
                          paddingLeft: "50px", // Padding to accommodate the left arrow button
                          overflowX: "auto",
                          scrollBehavior: "smooth",
                          height: "calc(100% - 40px)", // Keep height for scores only
                          overflowY: "auto", // Allow scrolling vertically for the scores
                        }}
                      >
                        {popularScores.map((score, index) => (
                          <Box key={index}>
                            <Link
                              to={`/customer-music-score-view/${score._id}`}
                              style={{ textDecoration: "none" }}
                            >
                              <Card
                                sx={{
                                  width: 200,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                  border: "2px solid #000",
                                  borderRadius: 10,
                                }}
                              >
                                <CardMedia
                                  component="img"
                                  height={280}
                                  image={score.imageUrl}
                                  alt={score.title}
                                />
                                <CardContent
                                  sx={{
                                    flexGrow: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Typography
                                    variant="h6"
                                    noWrap
                                    sx={{ textAlign: "center", mb: 1 }}
                                  >
                                    {score.title}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{ textAlign: "center" }}
                                  >
                                    {score.artist}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Link>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Grid>

                  {/* Right Box - Recommended Scores */}
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{
                        ml: 3,
                        position: "sticky",
                        top: 0,
                        backgroundColor: "#fff",
                        zIndex: 1,
                      }}
                    >
                      For You
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        ref={scrollContainerRef2}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)", // Creates a 3x3 grid
                          gap: "15px", // Increased the gap to 15px
                          paddingLeft: "50px", // Padding to accommodate the left arrow button
                          overflowX: "auto",
                          scrollBehavior: "smooth",
                          height: "calc(100% - 40px)", // Keep height for scores only
                          overflowY: "auto", // Allow scrolling vertically for the scores
                        }}
                      >
                        {recommendedScores.map((score, index) => (
                          <Box key={index}>
                            <Link
                              to={`/customer-music-score-view/${score._id}`}
                              style={{ textDecoration: "none" }}
                            >
                              <Card
                                sx={{
                                  width: 200,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                  border: "2px solid #000",
                                  borderRadius: 10,
                                }}
                              >
                                <CardMedia
                                  component="img"
                                  height={280}
                                  image={score.imageUrl}
                                  alt={score.title}
                                />
                                <CardContent
                                  sx={{
                                    flexGrow: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Typography
                                    variant="h6"
                                    noWrap
                                    sx={{ textAlign: "center", mb: 1 }}
                                  >
                                    {score.title}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{ textAlign: "center" }}
                                  >
                                    {score.artist}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Link>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </>
  );
}
