import React, { useEffect, useState } from "react";
import axios from "axios";
import Fuse from "fuse.js";
import {
  Box,
  List,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  ListItemButton,
  IconButton,
  Pagination,
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
  Home,
  LibraryBooks,
  Favorite,
  ShoppingCart,
  Feedback,
  AccountCircle,
  ExitToApp,
  FilterAlt,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import SidebarMozartifyLogo from "./assets/mozartify.png";

const options = {
  keys: [
    "mss_title",
    "mss_genre",
    "mss_composer",
    "mss_artist",
    "mss_instrumentation",
  ],
  threshold: 0.3, // Adjust the threshold for more or less fuzzy matching
};

export default function CustomerFavourites() {
  const [username, setUsername] = useState("");
  const [musicScores, setMusicScores] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const [genre, setGenre] = useState("");
  const [composer, setComposer] = useState("");
  const [instrumentation, setInstrumentation] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100);

  const navigate = useNavigate();

  const scoresPerPage = 10;

  const userId = "6663a93dd0f65edd4857eb95";

  // Fetch user's username and favorites
  useEffect(() => {
    axios
      .get(`http://localhost:3001/user/${userId}`)
      .then((response) => {
        setUsername(response.data.username);
        setFavorites(response.data.favorites || []);
      })
      .catch((error) => {
        console.error("Error fetching user details:", error);
      });
  }, [userId]);

  // Fetch user's music scores and filter by favorites
  useEffect(() => {
    axios
      .get(`http://localhost:3001/music-scores?userId=${userId}`)
      .then((response) => {
        const scoresWithLikes = response.data.filter((score) =>
          favorites.includes(score.mss_id)
        ).map((score) => ({
          ...score,
          liked: favorites.includes(score.mss_id), // Ensure this matches the favorite ID format
        }));
        setMusicScores(scoresWithLikes);
      })
      .catch((error) => {
        console.error("Error fetching music scores:", error);
      });
  }, [favorites, userId]);

  const handleFavoriteClick = (musicScoreId) => {
    axios
      .post(`http://localhost:3001/favourites`, { userId, musicScoreId })
      .then((response) => {
        const updatedFavorites = response.data.favorites;
        setFavorites(updatedFavorites);

        // Update the music scores to reflect the change
        setMusicScores((prevScores) =>
          prevScores.map((score) => {
            if (score.mss_id === musicScoreId) {
              return {
                ...score,
                liked: updatedFavorites.includes(musicScoreId),
              };
            }
            return score;
          })
        );
      })
      .catch((error) => {
        console.error("Error updating favorite:", error);
      });
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const fuse = new Fuse(musicScores, options);
  const filteredScores = searchQuery
    ? fuse.search(searchQuery).map((result) => result.item)
    : musicScores;

  const filterByGenre = (score) => {
    const result = !genre || score.mss_genre === genre;
    console.log(`Filtering by genre (${genre}):`, result, score);
    return result;
  };

  const filterByComposer = (score) => {
    const result =
      !composer ||
      score.mss_composer.toLowerCase().includes(composer.toLowerCase());
    console.log(`Filtering by composer (${composer}):`, result, score);
    return result;
  };

  const filterByInstrumentation = (score) => {
    const result =
      !instrumentation ||
      score.mss_instrumentation
        .toLowerCase()
        .includes(instrumentation.toLowerCase());
    console.log(
      `Filtering by instrumentation (${instrumentation}):`,
      result,
      score
    );
    return result;
  };

  const filterByPrice = (score) =>
    score.mss_price >= minPrice && score.mss_price <= maxPrice;

  const applyFilters = (scores) => {
    return scores.filter((score) => {
      return (
        filterByGenre(score) &&
        filterByComposer(score) &&
        filterByInstrumentation(score) &&
        filterByPrice(score)
      );
    });
  };

  const clearFilters = () => {
    setGenre("");
    setComposer("");
    setInstrumentation("");
    setMinPrice(0);
    setMaxPrice(100);
  };

  const filteredAndSearchedScores = applyFilters(filteredScores);
  console.log("Filtered and searched scores:", filteredAndSearchedScores);

  const indexOfLastScore = currentPage * scoresPerPage;
  const indexOfFirstScore = indexOfLastScore - scoresPerPage;
  const currentScores = filteredAndSearchedScores.slice(
    indexOfFirstScore,
    indexOfLastScore
  );

  const navigationItems = [
    { path: "/customer-homepage", label: "My Dashboard", icon: <Home /> },
    { path: "/customer-library", label: "Libraries", icon: <LibraryBooks /> },
    { path: "/customer-favourites", label: "Favourites", icon: <Favorite /> },
    { path: "/customer-mycart", label: "My Cart", icon: <ShoppingCart /> },
    { path: "/customer-feedback", label: "Feedback", icon: <Feedback /> },
    {
      path: "/customer-profile",
      label: "Customer Profile",
      icon: <AccountCircle />,
    },
    { path: "/login", label: "Logout", icon: <ExitToApp /> },
  ];

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
        <Box sx={{ width: 225, bgcolor: "#E4DCC8", p: 2, flexShrink: 0 }}>
          <Box
            sx={{
              textAlign: "center",
              mb: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pt: 5,
            }}
          >
            <img
              src={SidebarMozartifyLogo}
              alt="MozartifyIcon"
              style={{ maxWidth: "100%", maxHeight: "48px" }}
            />

            <Typography variant="h6" sx={{ mt: 2, fontFamily: "Montserrat" }}>
              Mozartify
            </Typography>
          </Box>
          <List>
            {navigationItems.map((item) => (
              <Link
                to={item.path}
                style={{ textDecoration: "none" }}
                key={item.path}
              >
                <ListItemButton>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </Link>
            ))}
          </List>
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
                <Box sx={{ width: 400, p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Filter Options
                  </Typography>

                  {/* Genre Filter */}
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
                      {/* Add more genres as needed */}
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

                      {/* Add more genres as needed */}
                    </Select>
                  </FormControl>

                  {/* Instrumentation Filter */}
                  <TextField
                    label="Instrumentation"
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 2 }}
                    value={instrumentation}
                    onChange={(e) => setInstrumentation(e.target.value)}
                  />

                  {/* Price Range Inputs */}
                  <TextField
                    label="Min Price"
                    variant="outlined"
                    fullWidth
                    type="number"
                    sx={{ mb: 2 }}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <TextField
                    label="Max Price"
                    variant="outlined"
                    fullWidth
                    type="number"
                    sx={{ mb: 2 }}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />

                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      mt: 4,
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
              </Drawer>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {username}
              </Typography>
              <Avatar>{username[0]}</Avatar>
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="h4">Favourites</Typography>
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
                    {filteredAndSearchedScores.length > 99
                      ? "99+"
                      : filteredAndSearchedScores.length}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <List>
              {currentScores.map((item, index) => (
                <ListItemButton
                  key={index}
                  onClick={() =>
                    navigate(
                      `/customer-favourites/customer-music-score-view/${item._id}`
                    )
                  }
                >
                  <ListItemText
                    primary={item.mss_title}
                    secondary={`Genre: ${item.mss_genre} | Composer: ${item.mss_composer} | Artist: ${item.mss_artist}`}
                  />
                  <ListItemIcon>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavoriteClick(item.mss_id);
                      }}
                    >
                      {item.liked ? (
                        <Favorite style={{ color: "#c44131" }} />
                      ) : (
                        <FavoriteBorder />
                      )}
                    </IconButton>
                  </ListItemIcon>
                  <ListItemIcon>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation(); /* Add play logic here */
                      }}
                    >
                      <PlayArrow />
                    </IconButton>
                  </ListItemIcon>
                </ListItemButton>
              ))}
            </List>
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination
                count={Math.ceil(
                  filteredAndSearchedScores.length / scoresPerPage
                )}
                page={currentPage}
                onChange={handlePageChange}
                variant="outlined"
                shape="rounded"
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
