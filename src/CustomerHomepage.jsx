import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
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
} from "@mui/material";
import Favorite from "@mui/icons-material/Favorite";
import {
  PlayArrow,
  FilterAlt,
  ArrowBack,
  ArrowForward,
} from "@mui/icons-material";
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

        const AddedScoreIds = response.data.map(
          (added) => added.score_id
        );

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
        (!genre || score.ms_genre === genre) &&
        (!composer ||
          score.ms_composer.toLowerCase().includes(composer.toLowerCase())) &&
        (!emotion ||
          score.ms_emotion.toLowerCase().includes(composer.toLowerCase())) &&
        (!instrumentation ||
          score.ms_instrumentation
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
          const imageUrl = await fetchImage(score.ms_cover_image);
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
        recommendedScores.map(async (score2) => {
          const imageUrl = await fetchImage(score2.ms_cover_image);
          return { ...score2, imageUrl };
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

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container.scrollLeft === 0) {
      container.scrollLeft = container.scrollWidth / 3;
    }
    container.scrollBy({
      left: -300,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
      container.scrollLeft = container.scrollWidth / 3 - container.clientWidth; // Move to the start of the second set of items
    }
    container.scrollBy({
      left: 300,
      behavior: "smooth",
    });
  };

  const scrollLeft2 = () => {
    const container = scrollContainerRef2.current;
    if (container.scrollLeft === 0) {
      container.scrollLeft = container.scrollWidth / 3; // Move to the end of the second set of items
    }
    container.scrollBy({
      left: -300,
      behavior: "smooth",
    });
  };

  const scrollRight2 = () => {
    const container = scrollContainerRef2.current;
    if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
      container.scrollLeft = container.scrollWidth / 3 - container.clientWidth; // Move to the start of the second set of items
    }
    container.scrollBy({
      left: 300,
      behavior: "smooth",
    });
  };

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
            overflow: "hidden",
            padding: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
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
                        <MenuItem value="All">All</MenuItem>
                        <MenuItem value="Classical">Classical</MenuItem>
                        <MenuItem value="Jazz">Jazz</MenuItem>
                        <MenuItem value="Pop">Pop</MenuItem>
                        <MenuItem value="Ragtime">Ragtime</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Composer</InputLabel>
                      <Select
                        label="Composer"
                        value={composer}
                        onChange={(e) => setComposer(e.target.value)}
                      >
                        <MenuItem value="All">All</MenuItem>
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

          <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="h4">
                {searchQuery || isFiltered ? "Search Result" : "Dashboard"}
              </Typography>
            </Box>
            {searchQuery ? (
              <Box>
                {searchedScores.length > 0 ? (
                  searchedScores.map((score) => (
                    <Box
                      key={score._id}
                      sx={{ display: "flex", alignItems: "center", mb: 2 }}
                    >
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">{score.ms_title}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Genre: {score.ms_genre} | Composer:{" "}
                          {score.ms_composer} | Artist: {score.ms_artist}
                        </Typography>
                      </Box>

                      {!purchasedScores.includes(score._id) &&
                        !addedToCartScores.includes(score._id) && (
                          <IconButton onClick={() => addToCart(score._id)}>
                            <ShoppingCartIcon />
                          </IconButton>
                        )}

                      <IconButton onClick={() => toggleFavorite(score._id)}>
                        <Favorite
                          color={
                            favorites.includes(score._id) ? "error" : "disabled"
                          }
                        />
                      </IconButton>
                      <IconButton>
                        <PlayArrow />
                      </IconButton>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2">No results found</Typography>
                )}
              </Box>
            ) : isFiltered ? (
              <Box>
                {filteredScores.length > 0 ? (
                  filteredScores.map((score) => (
                    <Box
                      key={score._id}
                      sx={{ display: "flex", alignItems: "center", mb: 2 }}
                    >
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">{score.ms_title}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Genre: {score.ms_genre} | Composer:{" "}
                          {score.ms_composer} | Artist: {score.ms_artist}
                        </Typography>
                      </Box>
                      <IconButton onClick={() => toggleFavorite(score._id)}>
                        <Favorite
                          color={
                            favorites.includes(score._id) ? "error" : "disabled"
                          }
                        />
                      </IconButton>
                      <IconButton>
                        <PlayArrow />
                      </IconButton>
                    </Box>
                  ))
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
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      Popular
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      <Box sx={{ width: "calc(100% - 60px)" }}>
                        <Box
                          sx={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <IconButton
                            onClick={scrollLeft}
                            sx={{
                              position: "absolute",
                              left: 0,
                              zIndex: 1,
                              backgroundColor: "#fff",
                              "&:hover": { backgroundColor: "#f0f0f0" },
                            }}
                          >
                            <ArrowBack />
                          </IconButton>

                          <Box
                            ref={scrollContainerRef}
                            sx={{
                              display: "flex",
                              overflowX: "auto",
                              scrollBehavior: "smooth",
                              whiteSpace: "nowrap",
                              paddingLeft: "50px", // Add padding to the left to accommodate the arrow button
                            }}
                          >
                            {popularScores.map((score, index) => (
                              <Box
                                key={index}
                                sx={{ flex: "0 0 auto", margin: "0 20px" }}
                              >
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
                                      alt={score.ms_title}
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
                                        {score.ms_title}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        color="textSecondary"
                                        sx={{ textAlign: "center" }}
                                      >
                                        {score.ms_artist}
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                </Link>
                              </Box>
                            ))}
                          </Box>

                          <IconButton
                            onClick={scrollRight}
                            sx={{
                              position: "absolute",
                              right: 0,
                              zIndex: 1,
                              backgroundColor: "#fff",
                              "&:hover": { backgroundColor: "#f0f0f0" },
                            }}
                          >
                            <ArrowForward />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom>
                      For You
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      <Box sx={{ width: "calc(100% - 60px)" }}>
                        <Box
                          sx={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <IconButton
                            onClick={scrollLeft2}
                            sx={{
                              position: "absolute",
                              left: 0,
                              zIndex: 1,
                              backgroundColor: "#fff",
                              "&:hover": { backgroundColor: "#f0f0f0" },
                            }}
                          >
                            <ArrowBack />
                          </IconButton>

                          <Box
                            ref={scrollContainerRef2}
                            sx={{
                              display: "flex",
                              overflowX: "auto",
                              scrollBehavior: "smooth",
                              whiteSpace: "nowrap",
                              paddingLeft: "50px", // Add padding to the left to accommodate the arrow button
                            }}
                          >
                            {recommendedScores.map((score, index) => (
                              <Box
                                key={index}
                                sx={{ flex: "0 0 auto", margin: "0 20px" }}
                              >
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
                                      alt={score.ms_title}
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
                                        {score.ms_title}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        color="textSecondary"
                                        sx={{ textAlign: "center" }}
                                      >
                                        {score.ms_artist}
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                </Link>
                              </Box>
                            ))}
                          </Box>

                          <IconButton
                            onClick={scrollRight2}
                            sx={{
                              position: "absolute",
                              right: 0,
                              zIndex: 1,
                              backgroundColor: "#fff",
                              "&:hover": { backgroundColor: "#f0f0f0" },
                            }}
                          >
                            <ArrowForward />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}
