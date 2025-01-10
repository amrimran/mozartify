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
  Skeleton,
  Divider,
} from "@mui/material";
import { keyframes } from "@mui/system";
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

  const [loading, setLoading] = useState(true);
  const popularScrollRef = useRef(null);
  const recommendedScrollRef = useRef(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  useEffect(() => {
    let scrollInterval;
    let userScrollTimeout;

    const startAutoScroll = (ref) => {
      if (ref.current) {
        scrollInterval = setInterval(() => {
          ref.current.scrollBy({
            top: 1, // Adjust the speed by increasing or decreasing this value
            behavior: "smooth",
          });

          // If at the bottom, scroll back to the top
          if (
            ref.current.scrollTop + ref.current.clientHeight >=
            ref.current.scrollHeight
          ) {
            ref.current.scrollTo({ top: 0, behavior: "smooth" });
          }
        }, 30); // Adjust interval speed
      }
    };

    const stopAutoScroll = () => {
      clearInterval(scrollInterval);
    };

    const handleUserScroll = () => {
      setIsUserScrolling(true);
      stopAutoScroll();
      clearTimeout(userScrollTimeout);
      userScrollTimeout = setTimeout(() => {
        setIsUserScrolling(false);
        startAutoScroll(popularScrollRef);
        startAutoScroll(recommendedScrollRef);
      }, 3000); // 3 seconds delay
    };

    // Start auto-scroll
    startAutoScroll(popularScrollRef);
    startAutoScroll(recommendedScrollRef);

    // Add event listeners for user interaction
    popularScrollRef.current?.addEventListener("scroll", handleUserScroll);
    recommendedScrollRef.current?.addEventListener("scroll", handleUserScroll);

    return () => {
      stopAutoScroll();
      popularScrollRef.current?.removeEventListener("scroll", handleUserScroll);
      recommendedScrollRef.current?.removeEventListener(
        "scroll",
        handleUserScroll
      );
    };
  }, []);

  const renderScores = (scores) => {
    return scores.map((score, index) => (
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
              boxShadow: "none",
            }}
          >
            <CardMedia
              component="img"
              height={280}
              image={score.coverImageUrl || "placeholder-image-url"} // Fallback to placeholder if empty
              alt={score.title || "No Title Available"} // Fallback for alt text
              sx={{
                border: "2px solid #000",
                borderRadius: 10,
                width: 200,
                padding: "10px",
                boxSizing: "border-box",
                display: score.coverImageUrl ? "block" : "none", // Hide if no image
              }}
            />
            {!score.coverImageUrl && (
              <Box
                sx={{
                  height: 280,
                  width: 200,
                  border: "2px solid #000",
                  borderRadius: 10,
                  padding: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxSizing: "border-box",
                  backgroundColor: "#f5f5f5",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Montserrat",
                    color: "#000",
                    textAlign: "center",
                  }}
                >
                  No Cover Image Available
                </Typography>
              </Box>
            )}
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
    ));
  };

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

  const scrollAnimation = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
`;

  useEffect(() => {
    setLoading(true);
    try {
      axios
        .get("http://localhost:3000/popular-music-scores")
        .then((response) => {
          setPopularScores(response.data);
        })
        .catch((error) => {
          console.error("Error fetching popular scores: ", error);
        });
    } catch (error) {
      console.error("Error fetching popular music scores:", error);
    } finally {
      setLoading(false);
    }
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
  @keyframes skeleton-wave {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
    100% {
      opacity: 1;
    }
  }
  
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }

  * {
    font-family: 'Montserrat', sans-serif;
  }
`;

  const buttonStyles = {
    px: 10,
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
  };

  const buttonStyles2 = {
    px: 10,
    fontFamily: "Montserrat",
    fontWeight: "bold",
    color: "#8BD3E6",
    backgroundColor: "#FFFFFF",
    border: "1px solid #8BD3E6",
    "&:hover": {
      backgroundColor: "#E6F8FB",
      color: "#7AB9C4",
      borderColor: "#7AB9C4",
    },
  };

  const deleteButtonStyles = {
    px: 10,

    fontFamily: "Montserrat",
    fontWeight: "bold",
    color: "#FFFFFF",
    borderColor: "#DB2226",
    backgroundColor: "#DB2226",

    boxShadow: "none", // Ensures no shadow on hover
    "&:hover": {
      backgroundColor: "#B71C1C", // Slightly darker red
      color: "#FFFFFF", // Keeps the text color consistent
      borderColor: "#B71C1C", // Matches the background color for cohesion
      boxShadow: "none", // Ensures no shadow on hover
    },
  };

  return (
    <>
      <GlobalStyle />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Box
          sx={{
            width: 225,
            flexShrink: 0, // Prevent shrinking
            overflowY: "auto", // Add scroll if content overflows
          }}
        >
          <CustomerSidebar />
        </Box>

        <Box sx={{ flexGrow: 1, p: 3, pl: 5 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 3,
              gap: 2,
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
                  border: "1px solid #8BD3E6",
                  borderRadius: "50px",
                }}
              >
                <InputBase
                  sx={{ ml: 1, flex: 1, fontFamily: "Montserrat" }}
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
                <FilterAlt sx={{ color: "#00000" }} />
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
                    fontFamily: "Montserrat",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontFamily: "Montserrat",
                      fontWeight: "bold",
                      textAlign: "center", // Centers the text horizontally
                    }}
                  >
                    Filter Options
                  </Typography>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel sx={{ fontFamily: "Montserrat" }}>
                      Genre
                    </InputLabel>
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
                      sx={{
                        fontFamily: "Montserrat",
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#8BD3E6", // Green outline on hover
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#8BD3E6", // Green outline when focused
                        },
                      }}
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
                    <InputLabel sx={{ fontFamily: "Montserrat" }}>
                      Emotion
                    </InputLabel>
                    <Select
                      label="Emotion"
                      value={emotion}
                      onChange={(e) => setEmotion(e.target.value)}
                      sx={{
                        fontFamily: "Montserrat",
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#8BD3E6", // Green outline on hover
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#8BD3E6", // Green outline when focused
                        },
                      }}
                    >
                      <MenuItem value="Angry" sx={{ fontFamily: "Montserrat" }}>
                        Angry
                      </MenuItem>
                      <MenuItem value="Happy" sx={{ fontFamily: "Montserrat" }}>
                        Happy
                      </MenuItem>
                      <MenuItem
                        value="Relaxed"
                        sx={{ fontFamily: "Montserrat" }}
                      >
                        Relaxed
                      </MenuItem>
                      <MenuItem value="Sad" sx={{ fontFamily: "Montserrat" }}>
                        Sad
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Instrumentation"
                    variant="outlined"
                    fullWidth
                    sx={{
                      mb: 2,
                      fontFamily: "Montserrat",
                      "& .MuiOutlinedInput-root": {
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#8BD3E6", // Green outline on hover
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#8BD3E6", // Green outline on focus
                        },
                      },
                    }}
                    InputLabelProps={{ style: { fontFamily: "Montserrat" } }}
                    InputProps={{ style: { fontFamily: "Montserrat" } }}
                    value={instrumentation}
                    onChange={(e) => setInstrumentation(e.target.value)}
                  />

                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                      mt: 2,
                      ...buttonStyles,
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
                      ...deleteButtonStyles,
                    }}
                    onClick={clearFilters}
                  >
                    CLEAR FILTERS
                  </Button>

                  <Box sx={{ mt: "auto" }}>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        mb: 2,
                        ...buttonStyles2,
                      }}
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      CLOSE FILTERS
                    </Button>
                  </Box>
                </Box>
              </Drawer>
            </Box>

            <Box
              sx={{
                position: "absolute",
                top: 28,
                right: 40,
                display: "flex",
                alignItems: "center",
              }}
            >
              {user ? (
                <>
                  <Typography
                    variant="body1"
                    sx={{ mr: 2, fontFamily: "Montserrat" }}
                  >
                    {user?.username}
                  </Typography>
                  <Avatar
                    alt={user?.username}
                    src={
                      user && user?.profile_picture
                        ? user?.profile_picture
                        : null
                    }
                  >
                    {(!user || !user?.profile_picture) &&
                      user?.username.charAt(0).toUpperCase()}
                  </Avatar>
                </>
              ) : (
                <>
                  <Skeleton
                    variant="text"
                    width={100}
                    height={24}
                    sx={{
                      mr: 2,
                      fontFamily: "Montserrat",
                      animation: "skeleton-wave 1.5s ease-in-out 0.5s infinite",
                    }}
                  />
                  <Skeleton variant="circular" width={40} height={40} />
                </>
              )}
            </Box>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontFamily: "Montserrat",
              fontWeight: "bold",
              mt: 4,
              mb: 3,
            }}
          >
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
            <Box
              sx={{
                height: "calc(80vh)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Grid container spacing={4}>
                {/* Left Box - Popular Scores */}
                <Grid
                  item
                  xs={5.5}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      position: "sticky",
                      top: 0,
                      backgroundColor: "#fff",
                      zIndex: 1,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontFamily: "Montserrat",
                      mb: 5,
                    }}
                  >
                    Popular
                  </Typography>
                  <Box
                    sx={{
                      height: "calc(80vh - 60px)", // Restrict the height to ensure the vertical scrolling works only here
                      overflowY: "auto", // Enable vertical scrolling ONLY for this section
                    }}
                  >
                    <Box
                      ref={scrollContainerRef}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 5,

                        scrollBehavior: "smooth",
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
                                boxShadow: "none",
                              }}
                            >
                              <CardMedia
                                component="img"
                                height={280}
                                image={
                                  score.coverImageUrl || "placeholder-image-url"
                                }
                                alt={score.title || "No Title Available"}
                                sx={{
                                  border: "2px solid #000",
                                  borderRadius: 10,
                                  width: 200,
                                  padding: "10px",
                                  boxSizing: "border-box",
                                  display: score.coverImageUrl
                                    ? "block"
                                    : "none",
                                }}
                              />
                              {!score.coverImageUrl && (
                                <Box
                                  sx={{
                                    height: 280,
                                    width: 200,
                                    border: "2px solid #000",
                                    borderRadius: 10,
                                    padding: "10px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxSizing: "border-box",
                                    backgroundColor: "#f5f5f5",
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontFamily: "Montserrat",
                                      color: "#000",
                                      textAlign: "center",
                                    }}
                                  >
                                    No Cover Image Available
                                  </Typography>
                                </Box>
                              )}
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

                {/* Vertical Divider */}
                <Grid
                  item
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mt: 10,
                  }}
                >
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                      borderWidth: 1,
                      borderColor: "gray",
                      height: "90%", // Adjust height of the Divider as needed
                    }}
                  />
                </Grid>

                {/* Right Box - Recommended Scores */}
                <Grid
                  item
                  xs={5.5}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      position: "sticky",
                      top: 0,
                      backgroundColor: "#fff",
                      zIndex: 1,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontFamily: "Montserrat",
                      mb: 5,
                    }}
                  >
                    For You
                  </Typography>

                  <Box
                    sx={{
                      height: "calc(80vh - 60px)", // Restrict the height to ensure the vertical scrolling works only here
                      overflowY: "auto", // Enable vertical scrolling ONLY for this section
                    }}
                  >
                    <Box
                      ref={scrollContainerRef2}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 5,
                        scrollBehavior: "smooth",
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
                                boxShadow: "none",
                              }}
                            >
                              <CardMedia
                                component="img"
                                height={280}
                                image={
                                  score.coverImageUrl || "placeholder-image-url"
                                }
                                alt={score.title || "No Title Available"}
                                sx={{
                                  border: "2px solid #000",
                                  borderRadius: 10,
                                  width: 200,
                                  padding: "10px",
                                  boxSizing: "border-box",
                                  display: score.coverImageUrl
                                    ? "block"
                                    : "none",
                                }}
                              />
                              {!score.coverImageUrl && (
                                <Box
                                  sx={{
                                    height: 280,
                                    width: 200,
                                    border: "2px solid #000",
                                    borderRadius: 10,
                                    padding: "10px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxSizing: "border-box",
                                    backgroundColor: "#f5f5f5",
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontFamily: "Montserrat",
                                      color: "#000",
                                      textAlign: "center",
                                    }}
                                  >
                                    No Cover Image Available
                                  </Typography>
                                </Box>
                              )}
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
          )}
        </Box>
      </Box>
    </>
  );
}
