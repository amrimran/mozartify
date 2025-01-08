import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Avatar,
  InputBase,
  Paper,
  Button,
  Drawer,
  FormControl,
  InputLabel,
  TextField,
  Select,
  MenuItem,
  Pagination,
  Skeleton,
} from "@mui/material";

import { FilterAlt } from "@mui/icons-material";
import ClerkSidebar from "./MusicEntryClerkSidebar";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";

// Add animation keyframes to GlobalStyle
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

export default function MusicEntryClerkHomepage() {
  const [user, setUser] = useState(null);

  const [unfilteredSearchedScores, setUnfilteredSearchedScores] = useState([]);

  const [searchedScores, setSearchedScores] = useState([]);
  const [filteredScores, setFilteredScores] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);

  const [musicScores, setMusicScores] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [genre, setGenre] = useState("");
  const [composer, setComposer] = useState("");
  const [instrumentation, setInstrumentation] = useState("");
  const [emotion, setEmotion] = useState("");

  const [page, setPage] = useState(1);

  const navigate = useNavigate();
  const itemsPerPage = 12;
  const [loading, setLoading] = useState(true);


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

  useEffect(() => {
    const fetchMusicScores = async () => {
      setLoading(true);
      try {
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
    fetchMusicScores();
  }, []);

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

  const SkeletonCard = () => (
    <Card sx={{ width: 210, boxShadow: 'none' }}>
      <Skeleton 
        variant="rectangular" 
        width={200} 
        height={280}
        sx={{ 
          borderRadius: 10,
          animation: "skeleton-wave 1.5s ease-in-out 0.5s infinite"
        }}
      />
      <CardContent>
        <Skeleton 
          width="80%" 
          height={28} 
          sx={{ 
            mb: 1,
            animation: "skeleton-wave 1.5s ease-in-out 0.5s infinite"
          }} 
        />
        <Skeleton 
          width="60%" 
          height={20} 
          sx={{ 
            animation: "skeleton-wave 1.5s ease-in-out 0.5s infinite"
          }}
        />
      </CardContent>
    </Card>
  );

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

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleCardClick = (scoreId) => {
    navigate(`/clerk-music-score-view/${scoreId}`);
  };

  return (
    <>
      <GlobalStyle />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Box
          sx={{
            width: 225,
            bgcolor: "#3B3183",
            flexShrink: 0, // Prevent shrinking
            overflowY: "auto", // Add scroll if content overflows
          }}
        >
          <ClerkSidebar active="dashboard" />
        </Box>
        <Box sx={{ flexGrow: 1, p: 3, pl: 5 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 3,
              gap: 2, // Space between search bar and filter button

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
                  placeholder="Look for music scores here..."
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
      fontFamily: "Montserrat", // Apply Montserrat globally to the Box
    }}
  >
    <Typography variant="h6" sx={{ mb: 2, fontFamily: "Montserrat" }}>
      Filter Options
    </Typography>

    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel sx={{ fontFamily: "Montserrat" }}>Genre</InputLabel>
      <Select
        label="Genre"
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
        sx={{ fontFamily: "Montserrat" }}
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
          <MenuItem key={item} value={item} sx={{ fontFamily: "Montserrat" }}>
            {item}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel sx={{ fontFamily: "Montserrat" }}>Composer</InputLabel>
      <Select
        label="Composer"
        value={composer}
        onChange={(e) => setComposer(e.target.value)}
        sx={{ fontFamily: "Montserrat" }}
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
      <InputLabel sx={{ fontFamily: "Montserrat" }}>Emotion</InputLabel>
      <Select
        label="Emotion"
        value={emotion}
        onChange={(e) => setEmotion(e.target.value)}
        sx={{ fontFamily: "Montserrat" }}
      >
        <MenuItem value="Angry" sx={{ fontFamily: "Montserrat" }}>
          Angry
        </MenuItem>
        <MenuItem value="Happy" sx={{ fontFamily: "Montserrat" }}>
          Happy
        </MenuItem>
        <MenuItem value="Relaxed" sx={{ fontFamily: "Montserrat" }}>
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
      sx={{ mb: 2, fontFamily: "Montserrat" }}
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
        borderColor: "#3B3183",
        color: "#3B3183",
        fontFamily: "Montserrat",
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
        borderColor: "#DB2226",
        color: "#DB2226",
        fontFamily: "Montserrat",
        "&:hover": {
          borderColor: "#DB2226",
          color: "#FFFFFF",
          backgroundColor: "#DB2226",
        },
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
          backgroundColor: "#3B3183",
          color: "#fff",
          fontFamily: "Montserrat",
          "&:hover": {
            backgroundColor: "#3B3183",
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

            <Box
  sx={{
    position: 'absolute',
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
        sx={{ mr: 2, fontFamily: "Montserrat",           animation: "skeleton-wave 1.5s ease-in-out 0.5s infinite"
        }}
      />
      <Skeleton
        variant="circular"
        width={40}
        height={40}
      />
    </>
 )}
 </Box>
</Box>



          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontFamily: "Montserrat", fontWeight: "bold", mt: 4, mb: 3 }}
          >
            {searchQuery
              ? "Search Results"
              : isFiltered
              ? "Filtered Results"
              : "Uploaded Music Scores"}
          </Typography>

          

          {/* Only show results count when searching or filtering */}
          {(searchQuery || isFiltered) && (
            <Typography variant="body1" sx={{ mb: 2, fontFamily: "Montserrat" }}>
              Found{" "}
              <Box component="span" sx={{ fontWeight: "bold", color: "#3B3183" }}>
                {displayedScores.length}
              </Box>{" "}
              results
            </Typography>
          )}

  

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)", // Ensures 4 cards per row
              gap: 3, // Controls spacing between the cards
            }}
          >
             {loading ? (
              Array(12).fill().map((_, index) => (
                <SkeletonCard key={index}  />
              ))
            ) : paginatedScores.length > 0 ? (
              paginatedScores.map((score) => (
                <Card
                  key={score._id}
                  sx={{
                    width: 210,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    boxShadow: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => handleCardClick(score._id)}
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
    padding: "10px", // Add padding for consistent spacing
    boxSizing: "border-box", // Ensure padding doesn't affect size
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
      padding: "10px", // Add padding for consistency with the image card
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxSizing: "border-box", // Maintain padding consistency
      backgroundColor: "#f5f5f5", // Light background for empty UI
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
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "Montserrat",
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      noWrap
                      sx={{
                        mb: 1,
                        fontFamily: "Montserrat",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        width: "100%",
                      }}
                    >
                      {score.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      noWrap
                      sx={{
                        fontFamily: "Montserrat",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        width: "100%",
                      }}
                    >
                      {score.artist}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            ) : searchQuery ? null : (
              <Typography variant="body2" sx={{ fontFamily: "Montserrat" }}>
                No scores found
              </Typography>
            )}
          </Box>
          {/* {paginatedScores.length > 0 ? (
            paginatedScores.map((score) => (
              <Card
                key={score._id}
                sx={{
                  width: 210,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  boxShadow: "none",
                  cursor: "pointer",
                }}
                onClick={() => handleCardClick(score._id)}
              >
                <CardMedia
                  component="img"
                  height={280}
                  image={score.coverImageUrl}
                  alt={score.title}
                  sx={{
                    border: "2px solid #000",
                    borderRadius: 10,
                    width: 200,
                  }}
                />
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Montserrat",
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    noWrap
                    sx={{
                      mb: 1,
                      fontFamily: "Montserrat",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      width: "100%",
                    }}
                  >
                    {score.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    noWrap
                    sx={{
                      fontFamily: "Montserrat",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      width: "100%",
                    }}
                  >
                    {score.artist}
                  </Typography>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body2" sx={{ fontFamily: "Montserrat" }}>
              No scores found
            </Typography>
          )} */}
          {paginatedScores.length > 0 && (
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={handlePageChange}
              color="primary"
              sx={{
                "& .MuiPaginationItem-root": {
                  borderRadius: 2,
                  fontFamily: "Montserrat",
                  backgroundColor: "primary",
                  color: "#000",
                  "&.Mui-selected": {
                    backgroundColor: "#8BD3E6",
                    color: "#fff",
                  },
                  "&:hover": {
                    backgroundColor: "#FFEE8C",
                  },
                },
              }}
            />
          </Box>
        )}
        </Box>

        {/* Pagination component */}
        
      </Box>
    </>
  );
}
