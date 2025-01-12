import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Skeleton,
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
  Snackbar,
  MenuItem,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  FavoriteBorder,
  PlayArrow,
  Favorite,
  FilterAlt,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import CustomerSidebar from "./CustomerSidebar";

axios.defaults.withCredentials = true;

export default function CustomerLibrary() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [user, setUser] = useState(null);

  const [currentScores, setCurrentScores] = useState([]);
  const [unfilteredScores, setUnfilteredScores] = useState([]);
  const [searchedScores, setSearchedScores] = useState([]);
  const [filteredScores, setFilteredScores] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState([]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [genre, setGenre] = useState("");
  const [composer, setComposer] = useState("");
  const [instrumentation, setInstrumentation] = useState("");
  const [emotion, setEmotion] = useState("");

  const navigate = useNavigate();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "",
  });

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    // Automatically close the sidebar when switching to mobile view
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

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
    const fetchOwnedScores = async () => {
      try {
        const purchaseResponse = await axios.get(
          "http://localhost:3000/user-purchases"
        );

        const purchasedScoreIds = purchaseResponse.data.map(
          (purchase) => purchase.score_id
        );

        if (purchasedScoreIds.length > 0) {
          const response = await axios.get(
            "http://localhost:3000/music-scores",
            {
              params: { scoreIds: purchasedScoreIds },
            }
          );

          setUnfilteredScores(response.data);
          setCurrentScores(response.data);
        } else {
          setUnfilteredScores([]);
        }
      } catch (error) {
        console.error("Error fetching owned scores:", error);
      }
    };

    fetchOwnedScores();
  }, []);

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

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return; // Prevent snackbar from closing on clickaway (optional)
    }

    setSnackbar({
      open: false,
      message: "",
      type: "",
    });
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
      const isFavorite = user?.favorites?.includes(musicScoreId);

      // Optimistically update the favorites locally for instant feedback
      setFavorites((prevFavorites) => {
        if (isFavorite) {
          // Remove from favorites
          return prevFavorites.filter((favId) => favId !== musicScoreId);
        } else {
          // Add to favorites
          return [...prevFavorites, musicScoreId];
        }
      });

      // Send the request to the server
      const response = await axios.post("http://localhost:3000/set-favorites", {
        musicScoreId,
        action: isFavorite ? "remove" : "add", // Explicitly specify the action
      });

      // Update the favorites with the server response (ensures consistency)
      setFavorites(response.data.favorites);

      // Show appropriate snackbar message
      setSnackbar({
        open: true,
        message: isFavorite
          ? "Removed from favorites successfully!"
          : "Added to favorites successfully!",
        type: isFavorite ? "unfavorite" : "favorite",
        reload: true, // Add a flag to determine whether to reload after snackbar
      });
    } catch (error) {
      console.error("Error updating favorites:", error);

      // Revert the optimistic update in case of an error
      setFavorites((prevFavorites) => {
        if (favorites) {
          // Add back the removed favorite
          return [...prevFavorites, musicScoreId];
        } else {
          // Remove the added favorite
          return prevFavorites.filter((favId) => favId !== musicScoreId);
        }
      });

      // Optionally show an error snackbar
      setSnackbar({
        open: true,
        message: "Failed to update favorites. Please try again.",
        type: "error",
        reload: false, // No reload on error
      });
    }
  };

  const GlobalStyle = createGlobalStyle`
    body {
      margin: 0;
      padding: 0;
      font-family: 'Montserrat', sans-serif;
      overflow-x: hidden;
    }

    @keyframes skeleton-wave {
      0% { opacity: 1; }
      50% { opacity: 0.4; }
      100% { opacity: 1; }
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
    boxShadow: "none", // Correct spelling
    border: "1px solid #8BD3E6",
    "&:hover": {
      boxShadow: "none", // Correct spelling
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
      <Box sx={{ display: "flex", height: "100vh", position: "relative" }}>
        {/* Mobile Menu Button */}
        {isMobile && (
          <IconButton
            sx={{ position: "absolute", top: 10, left: 10, zIndex: 1100 }}
            onClick={handleToggleSidebar}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Sidebar */}
        <Box
          sx={{
            width: isSidebarOpen ? (isMobile ? "100%" : 225) : 0,
            flexShrink: 0,
            transition: "width 0.3s",
            position: isMobile ? "fixed" : "relative",
            zIndex: 1000,
            height: "100%",
            display: isSidebarOpen ? "block" : "none",
          }}
        >
          <CustomerSidebar active="library" />
        </Box>
        {/* Main Content */}
        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 1, sm: 2, md: 3 },
            pl: { xs: 1, sm: 2, md: 5 },
            mb: 4,
            width: "100%",
            overflow: "auto",
          }}
        >
          {/* Search and Filter Section */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              mb: 3,
              mt: isMobile ? 5 : 0,
              gap: 2, // Add consistent spacing between elements
            }}
          >
            {/* Left spacing */}
            <Box sx={{ flex: "1 1 0" }} />

            {/* Search Bar Container */}
            <Box
              sx={{
                flex: "2 1 auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                maxWidth: { xs: "100%", sm: 600, md: 800 },
              }}
            >
              <Paper
                component="form"
                sx={{
                  p: "6px 10px",
                  display: "flex",
                  alignItems: "center",
                  width: { xs: 200, sm: 400, md: 600 }, // Adjust widths for different breakpoints
                  border: "1px solid #8BD3E6",
                  borderRadius: "50px",
                }}
              >
                <InputBase
                  sx={{ ml: 1, flex: 1, fontFamily: "Montserrat" }}
                  placeholder={
                    isMobile ? "Search..." : "Look for all music scores here..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Paper>
              <IconButton
                sx={{ p: "10px", ml: 2 }}
                onClick={() => setIsDrawerOpen(true)}
              >
                <FilterAlt />
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
                        <MenuItem
                          key={item}
                          value={item}
                          sx={{
                            fontFamily: "Montserrat",
                          }}
                        >
                          {item}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel sx={{ fontFamily: "Montserrat" }}>
                      Composer
                    </InputLabel>
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
                        <MenuItem
                          key={composerName}
                          value={composerName}
                          sx={{ fontFamily: "Montserrat" }}
                        >
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

            {/* User Info */}
            <Box
              sx={{
                flex: "1 1 0",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              {user ? (
                <>
                  <Typography
                    variant="body1"
                    sx={{
                      mr: 2,
                      fontFamily: "Montserrat",
                      display: { xs: "none", sm: "block" },
                    }}
                  >
                    {user?.username}
                  </Typography>
                  <Avatar
                    alt={user?.username}
                    src={user?.profile_picture || null}
                  >
                    {!user?.profile_picture &&
                      user?.username.charAt(0).toUpperCase()}
                  </Avatar>
                </>
              ) : (
                <>
                  <Skeleton
                    variant="text"
                    width={100}
                    height={24}
                    sx={{ mr: 2 }}
                  />
                  <Skeleton variant="circular" width={40} height={40} />
                </>
              )}
            </Box>
          </Box>

          {/* Library Title and Count */}
          <Box sx={{ px: { xs: 2, sm: 1 } }}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontFamily: "Montserrat",
                fontWeight: "bold",
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
              }}
            >
              Library
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: "Montserrat",
                fontWeight: "medium",
              }}
            >
              You have{" "}
              <Box
                component="span"
                sx={{ fontWeight: "bold", color: "#8BD3E6" }}
              >
                {currentScores.length > 99 ? "99+" : currentScores.length}
              </Box>{" "}
              scores
            </Typography>
          </Box>

          {/* Scores List */}
          <Box sx={{ flexGrow: 1, overflow: "auto", p: { xs: 1, sm: 2 } }}>
            <List>
              {currentScores.map((item) => (
                <ListItemButton
                  key={item._id}
                  onClick={() =>
                    navigate(
                      `/customer-library/customer-music-score-view/${item._id}`
                    )
                  }
                  sx={{
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    padding: { xs: 2, sm: 1 },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        sx={{
                          fontFamily: "Montserrat",
                          fontWeight: "bold",
                          fontSize: { xs: "0.9rem", sm: "1rem" },
                        }}
                      >
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "Montserrat",
                          color: "black",
                          fontSize: { xs: "0.8rem", sm: "0.9rem" },
                          mt: { xs: 1, sm: 0 },
                        }}
                      >
                        Genre: {item.genre} | Composer: {item.composer} |
                        Artist: {item.artist}
                      </Typography>
                    }
                  />

                  <ListItemIcon
                    sx={{
                      minWidth: { xs: "100%", sm: 40 },
                      mt: { xs: 1, sm: 0 },
                    }}
                  >
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item._id);
                      }}
                      sx={{ ml: { xs: -1, sm: 0 } }}
                    >
                      <Favorite
                        color={
                          favorites.includes(item._id) ? "error" : "disabled"
                        }
                      />
                    </IconButton>
                  </ListItemIcon>
                </ListItemButton>
              ))}
            </List>
          </Box>
        </Box>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000} // Set the duration before the snackbar disappears
        onClose={(event, reason) => {
          if (reason === "clickaway") {
            return; // Prevent snackbar from closing on clickaway if desired
          }
          handleSnackbarClose(); // Close the snackbar
          if (snackbar.reload) {
            window.location.reload(); // Reload the page after snackbar closes
          }
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.type === "error" ? "error" : "success"}
          sx={{
            width: "100%",
            bgcolor: snackbar.type === "unfavorite" ? "#F44336" : "#4CAF50",
            color: "white",
            "& .MuiAlert-icon": {
              color: "white",
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
