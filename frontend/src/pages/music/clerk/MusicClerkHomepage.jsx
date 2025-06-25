import {
  ArrowDownward,
  ArrowUpward,
  FilterAlt,
  Menu as MenuIcon,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Drawer,
  FormControl,
  IconButton,
  InputBase,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Skeleton,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import ClerkSidebar from "./MusicClerkSidebar";

const DRAWER_WIDTH = 225;

// Theme setup
const theme = createTheme({
  typography: {
    fontFamily: "Montserrat, Arial, sans-serif",
  },
  breakpoints: {
    values: {
      xs: 0, // mobile phones
      sm: 600, // tablets
      md: 960, // small laptops
      lg: 1280, // desktops
      xl: 1920, // large screens
    },
  },
});

// Global styles
const GlobalStyle = createGlobalStyle`
  @keyframes skeleton-wave {
    0% { opacity: 1; }
    50% { opacity: 0.4; }
    100% { opacity: 1; }
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

// Button styles
const buttonStyles = {
  px: { xs: 4, sm: 10 },
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#FFFFFF",
  backgroundColor: "#8BD3E6",
  border: "1px solid #8BD3E6",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#6FBCCF",
    borderColor: "#6FBCCF",
    boxShadow: "none",
  },
};

const buttonStyles2 = {
  px: { xs: 4, sm: 10 },
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#8BD3E6",
  backgroundColor: "#FFFFFF",
  boxShadow: "none",
  border: "1px solid #8BD3E6",
  "&:hover": {
    boxShadow: "none",
    backgroundColor: "#E6F8FB",
    color: "#7AB9C4",
    borderColor: "#7AB9C4",
  },
};

const deleteButtonStyles = {
  px: { xs: 4, sm: 10 },
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#FFFFFF",
  borderColor: "#DB2226",
  backgroundColor: "#DB2226",
  boxShadow: "none",
  "&:hover": {
    boxShadow: "none",
    backgroundColor: "#B71C1C",
    borderColor: "#B71C1C",
  },
};

export default function MusicEntryClerkHomepage() {
  const navigate = useNavigate();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortBy, setSortBy] = useState("_id");
  const [loading, setLoading] = useState(true);
  const [isFiltered, setIsFiltered] = useState(false);
  const [musicScores, setMusicScores] = useState([]);
  const itemsPerPage = 12;
  const [genre, setGenre] = useState("");
  const [composer, setComposer] = useState("");
  const [instrumentation, setInstrumentation] = useState("");
  const [emotion, setEmotion] = useState("");
  const [unfilteredSearchedScores, setUnfilteredSearchedScores] = useState([]);
  const [searchedScores, setSearchedScores] = useState([]);
  const [filteredScores, setFilteredScores] = useState([]);

  // Grid columns based on screen size
  const gridColumns = {
    xs: 1, // 1 column for mobile
    sm: 2, // 2 columns for tablets
    md: 3, // 3 columns for small laptops
    lg: 4, // 4 columns for desktops
  };

  // Responsive styles
  const styles = {
    root: {
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "#FFFFFF",
    },
    appBar: {
      display: isLargeScreen ? "none" : "block",
      backgroundColor: "#FFFFFF",
      boxShadow: "none",
      borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
      width: "100%",
    },
    drawer: {
      width: DRAWER_WIDTH,
      flexShrink: 0,
      display: isLargeScreen ? "block" : "none",
      "& .MuiDrawer-paper": {
        width: DRAWER_WIDTH,
        boxSizing: "border-box",
      },
    },
    mobileDrawer: {
      display: isLargeScreen ? "none" : "block",
      "& .MuiDrawer-paper": {
        width: DRAWER_WIDTH,
        boxSizing: "border-box",
      },
    },
    mainContent: {
      flexGrow: 1,
      p: { xs: 2, sm: 3 },
      mt: isLargeScreen ? 0 : 8,
      ml: isLargeScreen ? 5 : 0, // Set margin-left to 0 for large screens
      width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
    },
    searchContainer: {
      display: "flex",
      alignItems: "center",
      gap: { xs: 1, sm: 2 },
      flex: 1,
      maxWidth: { xs: "100%", sm: 700 },
      mx: { xs: 1, sm: 4 },
    },
    cardGrid: {
      display: "grid",
      gridTemplateColumns: {
        xs: "repeat(1, 1fr)",
        sm: "repeat(2, 1fr)",
        md: "repeat(3, 1fr)",
        lg: "repeat(4, 1fr)",
      },
      gap: { xs: 2, sm: 3 },
    },
    card: {
      width: { xs: "100%", sm: 210 },
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      boxShadow: "none",
      cursor: "pointer",
    },
    cardMedia: {
      height: { xs: 200, sm: 280 },
      width: "100%",
      maxWidth: { xs: "100%", sm: 200 },
      border: "2px solid #000",
      borderRadius: 10,
      padding: "10px",
      boxSizing: "border-box",
    },
  };

  // Component for skeleton loading
  const SkeletonCard = () => (
    <Card sx={styles.card}>
      <Box sx={{ padding: "10px", width: "100%" }}>
        <Skeleton
          variant="rectangular"
          sx={{
            width: "100%",
            height: { xs: 200, sm: 280 },
            borderRadius: 10,
            animation: "skeleton-wave 1s ease-in-out infinite",
          }}
        />
      </Box>
      <CardContent
        sx={{
          padding: "16px 8px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Skeleton
          variant="text"
          width="70%"
          height={24}
          sx={{ mb: 1, animation: "skeleton-wave 1s ease-in-out infinite" }}
        />
        <Skeleton
          variant="text"
          width="50%"
          height={20}
          sx={{ animation: "skeleton-wave 1s ease-in-out infinite" }}
        />
      </CardContent>
    </Card>
  );

  const fetchMusicScores = async (order = "desc", field = "_id") => {
    setLoading(true);
    try {
      // Add setTimeout to create a 2-second delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await axios.get("http://localhost:3001/abc-file");
      const transformedScores = response.data.map((score) => ({
        ...score,
        _id: score._id.$oid || score._id.toString() || score._id,
        title: String(score.title || "Untitled"),
        artist: String(score.artist || "Unknown Artist"),
      }));

      setMusicScores(transformedScores);
    } catch (error) {
      console.error("Error fetching music scores:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update useEffect to include sortBy
  useEffect(() => {
    fetchMusicScores(sortOrder, sortBy);
  }, [sortOrder, sortBy]);

  useEffect(() => {
    // When search query changes, reset filters
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
          setIsFiltered(false); // Reset filter state when searching
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

  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Pagination handler
  const handlePageChange = (event, value) => {
    setPage(value);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getDisplayedScores = () => {
    if (searchQuery && isFiltered) {
      // If we're searching and filters are applied, show filtered search results
      return searchedScores;
    } else if (searchQuery) {
      // If we're only searching without filters, show search results
      return searchedScores;
    } else if (isFiltered) {
      // If we're only filtering without search, show filtered scores
      return filteredScores;
    } else {
      // Default case: show all music scores
      return musicScores;
    }
  };

  const displayedScores = getDisplayedScores();
  const paginatedScores = displayedScores.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  const pageCount = Math.ceil(displayedScores.length / itemsPerPage);

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
    if (searchQuery) {
      setSearchedScores(unfilteredSearchedScores);
    }
  };

  const handleFilterRequest = async () => {
    const hasFilter = genre || composer || instrumentation || emotion;

    if (hasFilter) {
      setIsFiltered(true);
      try {
        if (searchQuery) {
          // Apply filters to search results
          const filteredSearchResults = applyFilters(unfilteredSearchedScores);
          setSearchedScores(filteredSearchResults);
        } else {
          // Apply filters to all scores
          const response = await axios.get(
            "http://localhost:3000/filter-music-scores",
            {
              params: { genre, composer, instrumentation, emotion },
            }
          );
          setFilteredScores(response.data);
        }
      } catch (error) {
        console.error("Error fetching filtered scores:", error);
      }
    } else {
      setIsFiltered(false);
      if (searchQuery) {
        setSearchedScores(unfilteredSearchedScores);
      }
    }
  };

  const handleCardClick = (scoreId) => {
    navigate(`/clerk-music-score-view/${scoreId}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Box sx={styles.root}>
        {/* Mobile AppBar */}
        <AppBar position="fixed" sx={styles.appBar}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, color: "#3B3183" }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              sx={{ color: "#3B3183", fontWeight: "bold" }}
            >
              Uploaded Music Scores
            </Typography>

            {/* Mobile user info */}
            {!isLargeScreen && (
              <Box
                sx={{
                  ml: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {!isMobile && (
                  <Typography variant="body2" sx={{ color: "#3B3183" }}>
                    {user?.username}
                  </Typography>
                )}
                <Avatar
                  alt={user?.username}
                  src={user?.profile_picture}
                  sx={{ width: 32, height: 32 }}
                >
                  {user?.username?.charAt(0).toUpperCase()}
                </Avatar>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        {/* Permanent drawer for large screens */}
        <Drawer variant="permanent" sx={styles.drawer}>
          <ClerkSidebar active="dashboard" />
        </Drawer>

        {/* Temporary drawer for smaller screens */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={styles.mobileDrawer}
        >
          <ClerkSidebar active="dashboard" />
        </Drawer>

        {/* Main content */}
        <Box component="main" sx={styles.mainContent}>
          {/* Header section */}

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              gap: { xs: 2, sm: 0 },
              mb: 3,
              mt: 2,
            }}
          >
            {/* Sort controls */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                size={isMobile ? "small" : "medium"}
                sx={{
                  minWidth: { xs: 100, sm: 120 },
                  fontFamily: "Montserrat",

                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#8BD3E6",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#8BD3E6",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#8BD3E6",
                  },
                }}
              >
                <MenuItem value="_id">Date Added</MenuItem>
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="artist">Artist</MenuItem>
              </Select>

              <IconButton
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
              >
                {sortOrder === "asc" ? <ArrowUpward /> : <ArrowDownward />}
              </IconButton>
            </Box>

            {/* Search and filter section */}
            <Box sx={styles.searchContainer}>
              <Paper
                component="form"
                sx={{
                  p: "4px 8px",
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  borderRadius: "50px",
                  border: "1px solid #8BD3E6",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow for elevation
                  transition:
                    "border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                  "&:hover": {
                    borderColor: "#6FBCCF", // Darker border on hover
                    boxShadow: "0px 4px 10px #8BD3E6", // Slightly stronger shadow
                  },
                }}
              >
                <InputBase
                  sx={{ ml: 2, flex: 1 }}
                  placeholder={
                    isMobile
                      ? "Search music scores..."
                      : "Look for all music scores here..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Paper>

              <IconButton onClick={() => setIsDrawerOpen(true)}>
                <FilterAlt />
              </IconButton>
            </Box>

            {/* Desktop user info */}
            {isLargeScreen && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  ml: "auto",
                }}
              >
                <Typography>{user?.username}</Typography>
                <Avatar
                  alt={user?.username}
                  src={user?.profile_picture}
                  sx={{ width: 40, height: 40 }}
                >
                  {user?.username?.charAt(0).toUpperCase()}
                </Avatar>
              </Box>
            )}
          </Box>

          {/* Results Title and Count Section */}
          <Box
            sx={{
              mt: { xs: 2, sm: 3, md: 4 },
              mb: { xs: 2, sm: 3 },
              px: { xs: 1, sm: 0 },
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontFamily: "Montserrat",
                fontWeight: "bold",
                fontSize: {
                  xs: "1.25rem",
                  sm: "1.5rem",
                  md: "1.75rem",
                },
                textAlign: { xs: "left", sm: "left" },
              }}
            >
              {searchQuery
                ? "Search Results"
                : isFiltered
                  ? "Filtered Results"
                  : "Uploaded Music Scores"}
            </Typography>

            {/* Results count - Simplified for mobile */}
            {(searchQuery || isFiltered) && (
              <Typography
                variant="body1"
                sx={{
                  mb: { xs: 1, sm: 2 },
                  fontFamily: "Montserrat",
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  textAlign: { xs: "left", sm: "left" },
                }}
              >
                {isMobile ? (
                  // Mobile view - single line
                  <span>
                    Found{" "}
                    <Box
                      component="span"
                      sx={{ fontWeight: "bold", color: "#8BD3E6" }}
                    >
                      {displayedScores.length}
                    </Box>{" "}
                    results
                  </span>
                ) : (
                  // Desktop view - more spaced out
                  <>
                    Found{" "}
                    <Box
                      component="span"
                      sx={{ fontWeight: "bold", color: "#8BD3E6" }}
                    >
                      {displayedScores.length}
                    </Box>{" "}
                    results
                  </>
                )}
              </Typography>
            )}
          </Box>

          {/* Music scores grid */}
          <Box sx={styles.cardGrid}>
            {loading ? (
              Array(gridColumns[isMobile ? "xs" : isTablet ? "sm" : "lg"])
                .fill()
                .map((_, index) => <SkeletonCard key={index} />)
            ) : paginatedScores.length > 0 ? (
              paginatedScores.map((score) => (
                <Card
                  key={score._id}
                  onClick={() => handleCardClick(score._id)}
                  sx={{
                    width: { xs: "100%", sm: 210 },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    boxShadow: "none",
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "scale(1.02)",
                    },
                  }}
                >
                  {score.coverImageUrl ? (
                    <CardMedia
                      component="img"
                      image={score.coverImageUrl}
                      alt={score.title}
                      sx={{
                        height: { xs: 200, sm: 280 },
                        width: { xs: "100%", sm: 200 },
                        borderRadius: 10,
                        border: "2px solid #000",
                        padding: "10px",
                        boxSizing: "border-box",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: { xs: 200, sm: 280 },
                        width: { xs: "100%", sm: 200 },
                        border: "2px solid #000",
                        borderRadius: 10,
                        padding: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f5f5f5",
                        boxSizing: "border-box",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "Montserrat",
                          color: "#000",
                          textAlign: "center",
                          px: 2,
                        }}
                      >
                        No Cover Image Available
                      </Typography>
                    </Box>
                  )}

                  <CardContent
                    sx={{
                      width: "100%",
                      padding: { xs: "16px 8px", sm: "16px" },
                      "&:last-child": { pb: 2 },
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: "Montserrat",
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                        fontWeight: "bold",
                        mb: 1,
                        textAlign: "center",
                        width: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {score.title || "Untitled"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        fontFamily: "Montserrat",
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        textAlign: "center",
                        width: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {score.artist || "Unknown Artist"}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "Montserrat",
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  py: 4,
                }}
              >
                No music scores found
              </Typography>
            )}
          </Box>

          {/* Pagination */}
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={handlePageChange}
              size={isMobile ? "small" : "medium"}
              sx={{
                "& .MuiPaginationItem-root": {
                  borderRadius: 2,
                  fontFamily: "Montserrat",
                  backgroundColor: "primary",
                  color: "#000",
                  "&.Mui-selected": {
                    backgroundColor: "#8BD3E6", // Blue for selected
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: "#8BD3E6", // Keep blue when hovered if selected
                    },
                  },
                  "&:hover": {
                    backgroundColor: "#D3D3D3", // Neutral gray for unselected hover
                  },
                },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 400, md: 350 },
            height: "100%",
            overflow: "auto",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100%",
            p: { xs: 2, sm: 3 },
          }}
        >
          {/* Header */}
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              fontWeight: "bold",
              mb: 3,
              fontFamily: "Montserrat",
            }}
          >
            Filter Options
          </Typography>

          {/* Filter Form Section */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <FormControl fullWidth>
              <InputLabel>Genre</InputLabel>
              <Select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                label="Genre"
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#8BD3E6",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#6FBCCF",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#6FBCCF",
                  },
                }}
              >
                {genres.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Composer</InputLabel>
              <Select
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                label="Composer"
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#8BD3E6",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#6FBCCF",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#6FBCCF",
                  },
                }}
              >
                {composers.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Emotion</InputLabel>
              <Select
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
                label="Emotion"
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#8BD3E6",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#6FBCCF",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#6FBCCF",
                  },
                }}
              >
                {emotions.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Instrumentation"
              value={instrumentation}
              onChange={(e) => setInstrumentation(e.target.value)}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#8BD3E6",
                  },
                  "&:hover fieldset": {
                    borderColor: "#6FBCCF",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#6FBCCF",
                  },
                },
              }}
            />
          </Box>

          {/* Buttons Section - Using marginTop: auto to push it to bottom */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: "2", // This pushes the button section to the bottom
              pt: 4, // Adds padding top for spacing
            }}
          >
            <Button
              variant="contained"
              fullWidth
              onClick={handleFilterRequest}
              sx={buttonStyles}
            >
              APPLY FILTERS
            </Button>

            <Button
              variant="contained"
              fullWidth
              onClick={clearFilters}
              sx={deleteButtonStyles}
            >
              CLEAR FILTERS
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => setIsDrawerOpen(false)}
              sx={buttonStyles2}
            >
              CLOSE FILTERS
            </Button>
          </Box>
        </Box>
      </Drawer>
    </ThemeProvider>
  );
}

// Data arrays for select inputs
const genres = [
  "Baroque",
  "Children's",
  "Classical",
  "Disco",
  "Impressionist",
  "Pop",
  "Rock",
  "Renaissance Polyphony",
];

const composers = [
  "Antonio Vivaldi",
  "Claude Debussy",
  "Emil Aarestrup",
  "Heinrich Faber",
  "Johann Pachelbel",
  "John Lennon, Paul McCartney",
  "Ludwig van Beethoven",
  "Wolfgang Amadeus Mozart",
];

const emotions = ["Angry", "Happy", "Relaxed", "Sad"];
