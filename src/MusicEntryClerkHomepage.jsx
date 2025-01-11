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
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";

// Update animation keyframes to 2 seconds
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
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortBy, setSortBy] = useState("_id"); // Add this state

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

      // Custom sorting logic
      const sortedScores = transformedScores.sort((a, b) => {
        const valueA = a[field] ? a[field].toString().toLowerCase() : "";
        const valueB = b[field] ? b[field].toString().toLowerCase() : "";

        if (field === "title") {
          const isUnknownA = a.title === "Untitled";
          const isUnknownB = b.title === "Untitled";

          if (isUnknownA && !isUnknownB) return 1; // Untitled items go to the back
          if (!isUnknownA && isUnknownB) return -1;

          // If titles are known, sort by title; otherwise, sort by artist
          return order === "asc"
            ? valueA.localeCompare(valueB) ||
                a.artist.toLowerCase().localeCompare(b.artist.toLowerCase())
            : valueB.localeCompare(valueA) ||
                b.artist.toLowerCase().localeCompare(a.artist.toLowerCase());
        }

        if (field === "artist") {
          const isUnknownA = a.artist === "Unknown Artist";
          const isUnknownB = b.artist === "Unknown Artist";

          if (isUnknownA && !isUnknownB) return 1; // Unknown Artist items go to the back
          if (!isUnknownA && isUnknownB) return -1;

          // If artists are known, sort by artist; otherwise, sort by title
          return order === "asc"
            ? valueA.localeCompare(valueB) ||
                a.title.toLowerCase().localeCompare(b.title.toLowerCase())
            : valueB.localeCompare(valueA) ||
                b.title.toLowerCase().localeCompare(a.title.toLowerCase());
        }

        // Default sorting for other fields
        return order === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      });

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

  // Modify the sort toggle handler
  const handleSortToggle = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
  };

  // Add handler for changing sort field
  const handleSortByChange = (field) => {
    setSortBy(field);
  };

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
    <Card
      sx={{
        width: 210,
        boxShadow: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box sx={{ padding: "10px" }}>
        <Skeleton
          variant="rectangular"
          width={200}
          height={280}
          sx={{
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
          "&:last-child": {
            paddingBottom: "16px",
          },
        }}
      >
        <Skeleton
          variant="text"
          width="70%"
          height={24}
          sx={{
            mb: 1,
            animation: "skeleton-wave 1s ease-in-out infinite",
            borderRadius: 0.5,
          }}
        />
        <Skeleton
          variant="text"
          width="50%"
          height={20}
          sx={{
            animation: "skeleton-wave 1s ease-in-out infinite",
            borderRadius: 0.5,
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
              alignItems: "center", // Align all items vertically
              justifyContent: "space-between",
              mb: 3,
              mt: 2,
              position: "relative",
              height: 48, // Fixed height for consistency
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              {/* Sort field selector */}
              <Select
                value={sortBy}
                onChange={(e) => handleSortByChange(e.target.value)}
                sx={{
                  height: 40,
                  minWidth: 120,
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
                <MenuItem value="_id" sx={{ fontFamily: "Montserrat" }}>
                  Date Added
                </MenuItem>
                <MenuItem value="title" sx={{ fontFamily: "Montserrat" }}>
                  Title
                </MenuItem>
                <MenuItem value="artist" sx={{ fontFamily: "Montserrat" }}>
                  Artist
                </MenuItem>
              </Select>

              {/* Sort order toggle */}
              <IconButton
                onClick={handleSortToggle}
                sx={{
                  color: "#8BD3E6",
                  height: 40,
                  width: 40,
                  "&:hover": {
                    backgroundColor: "rgba(139, 211, 230, 0.1)",
                  },
                }}
              >
                {sortOrder === "asc" ? <ArrowUpward /> : <ArrowDownward />}
              </IconButton>
            </Box>

            {/* Search and filter container */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flex: 1,
                maxWidth: 700,
                mx: 4,
              }}
            >
              <Paper
                component="form"
                sx={{
                  p: "2px 4px",
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  height: 40,
                  border: "1px solid #8BD3E6",
                  borderRadius: "50px",
                }}
              >
                <InputBase
                  sx={{
                    ml: 2,
                    flex: 1,
                    fontFamily: "Montserrat",
                    height: "100%",
                  }}
                  placeholder="Look for music scores here..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Paper>
              <IconButton
                sx={{
                  height: 40,
                  width: 40,
                }}
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
                    fontFamily: "Montserrat", // Apply Montserrat globally to the Box
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

            {/* User info container */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              {user ? (
                <>
                  <Typography variant="body1" sx={{ fontFamily: "Montserrat" }}>
                    {user?.username}
                  </Typography>
                  <Avatar
                    alt={user?.username}
                    src={user?.profile_picture || null}
                    sx={{ height: 40, width: 40 }}
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
                    sx={{
                      mr: 2,
                      fontFamily: "Montserrat",
                      animation: "skeleton-wave 1s ease-in-out infinite",
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
            <Typography
              variant="body1"
              sx={{ mb: 2, fontFamily: "Montserrat" }}
            >
              Found{" "}
              <Box
                component="span"
                sx={{ fontWeight: "bold", color: "#8BD3E6" }}
              >
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
              Array(12)
                .fill()
                .map((_, index) => <SkeletonCard key={index} />)
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
          )}
        </Box>

        {/* Pagination component */}
      </Box>
    </>
  );
}
