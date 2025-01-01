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
} from "@mui/material";
import { FilterAlt } from "@mui/icons-material";
import ClerkSidebar from "./MusicEntryClerkSidebar";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
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
  const [musicScores, setMusicScores] = useState([]);
  const [searchedScores, setSearchedScores] = useState([]);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [genre, setGenre] = useState("");
  const [composer, setComposer] = useState("");
  const [instrumentation, setInstrumentation] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();
  const itemsPerPage = 12;

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
      try {
        const response = await axios.get("http://localhost:3001/abc-file");
        // Transform the data to ensure string IDs
        const transformedScores = response.data.map(score => ({
          ...score,
          _id: score._id.$oid || score._id.toString() || score._id,
          title: String(score.title || 'Untitled'),
          artist: String(score.artist || 'Unknown Artist'),
        }));
        setMusicScores(transformedScores);
      } catch (error) {
        console.error("Error fetching music scores:", error);
      }
    };
    fetchMusicScores();
  }, []);

  useEffect(() => {
    const searchScores = async () => {
      if (searchQuery) {
        try {
          const response = await axios.get(
            "http://localhost:3000/search-music-scores",
            {
              params: { query: searchQuery }
            }
          );
          // Transform search results the same way
          const transformedResults = response.data.map(score => ({
            ...score,
            _id: score._id.$oid || score._id.toString() || score._id,
            title: String(score.title || 'Untitled'),
            artist: String(score.artist || 'Unknown Artist'),
          }));
          setSearchedScores(transformedResults);
        } catch (error) {
          console.error("Error searching scores:", error);
        }
      } else {
        setSearchedScores([]);
      }
    };
    searchScores();
  }, [searchQuery]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const clearFilters = () => {
    setGenre("");
    setComposer("");
    setInstrumentation("");
    setMinPrice(0);
    setMaxPrice(100);
  };

  const handleCardClick = (scoreId) => {
    navigate(`/clerk-music-score-view/${scoreId}`);
  };

  const displayedScores = searchQuery ? searchedScores : musicScores;
  const paginatedScores = displayedScores.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  const pageCount = Math.ceil(displayedScores.length / itemsPerPage);

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
                  border: "1px solid #8BD3E6",
                  borderRadius: "50px",
                }}
              >
                <InputBase
                  sx={{ ml: 1, flex: 1, fontFamily: 'Montserrat' }}
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
                <Box sx={{ width: 400, p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Montserrat' }}>
                    Filter Options
                  </Typography>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel sx={{ fontFamily: 'Montserrat' }}>Genre</InputLabel>
                    <Select
                      label="Genre"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      sx={{ fontFamily: 'Montserrat' }}
                    >
                      <MenuItem value="" sx={{ fontFamily: 'Montserrat' }}>All</MenuItem>
                      <MenuItem value="Classical" sx={{ fontFamily: 'Montserrat' }}>Classical</MenuItem>
                      <MenuItem value="Jazz" sx={{ fontFamily: 'Montserrat' }}>Jazz</MenuItem>
                      <MenuItem value="Pop" sx={{ fontFamily: 'Montserrat' }}>Pop</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel sx={{ fontFamily: 'Montserrat' }}>Composer</InputLabel>
                    <Select
                      label="Composer"
                      value={composer}
                      onChange={(e) => setComposer(e.target.value)}
                      sx={{ fontFamily: 'Montserrat' }}
                    >
                      <MenuItem value="" sx={{ fontFamily: 'Montserrat' }}>All</MenuItem>
                      <MenuItem value="Mozart" sx={{ fontFamily: 'Montserrat' }}>Mozart</MenuItem>
                      <MenuItem value="Beethoven" sx={{ fontFamily: 'Montserrat' }}>Beethoven</MenuItem>
                      <MenuItem value="Gershwin" sx={{ fontFamily: 'Montserrat' }}>Gershwin</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Instrumentation"
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 2, fontFamily: 'Montserrat' }}
                    value={instrumentation}
                    onChange={(e) => setInstrumentation(e.target.value)}
                    InputLabelProps={{ sx: { fontFamily: 'Montserrat' } }}
                  />

                  <TextField
                    label="Min Price"
                    variant="outlined"
                    fullWidth
                    type="number"
                    sx={{ mb: 2, fontFamily: 'Montserrat' }}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    InputLabelProps={{ sx: { fontFamily: 'Montserrat' } }}
                  />
                  <TextField
                    label="Max Price"
                    variant="outlined"
                    fullWidth
                    type="number"
                    sx={{ mb: 2, fontFamily: 'Montserrat' }}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    InputLabelProps={{ sx: { fontFamily: 'Montserrat' } }}
                  />

                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      mt: 4,
                      backgroundColor: "#483C32",
                      color: "#fff",
                      fontFamily: 'Montserrat',
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
                      fontFamily: 'Montserrat',
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
              {user ? (
                <>
                  <Typography variant="body1" sx={{ mr: 2, fontFamily: 'Montserrat' }}>
                    {user.username}
                  </Typography>
                  <Avatar>{user.username.charAt(0)}</Avatar>
                </>
              ) : (
                <Typography variant="body1" sx={{ mr: 2, fontFamily: 'Montserrat' }}>
                  Loading...
                </Typography>
              )}
            </Box>
          </Box>

          <Typography variant="h5" gutterBottom sx={{ fontFamily: 'Montserrat', fontWeight: 'bold', mt: 4, mb: 3 }}>
            {searchQuery ? 'Search Results' : 'Uploaded Music Scores'}
          </Typography>

          {/* Display search result count if searching */}
          {searchQuery && (
            <Typography variant="body1" sx={{ mb: 2, fontFamily: "Montserrat" }}>
            Found <Box component="span" sx={{ fontWeight: "bold", color: "#3B3183" }}>{searchedScores.length}</Box> results
          </Typography>
          
          )}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 3,
            }}
          >

{paginatedScores.length > 0 ? (
  paginatedScores.map((score) => (
    <Card
      key={score._id}
      sx={{
        width: 210,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: 'none',
        cursor: 'pointer',
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
          fontFamily: 'Montserrat',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h6"
          noWrap
          sx={{
            mb: 1,
            fontFamily: 'Montserrat',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            width: '100%',
          }}
        >
          {score.title}
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          noWrap
          sx={{
            fontFamily: 'Montserrat',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            width: '100%',
          }}
        >
          {score.artist}
        </Typography>
      </CardContent>
    </Card>
  ))
) : (
  searchQuery ? null : (
    <Typography variant="body2" sx={{ fontFamily: 'Montserrat' }}>
      No scores found
    </Typography>
  )
)}

</Box>

          {/* Pagination component */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={handlePageChange}
            color="primary"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 2, // Makes the pagination buttons square
                fontFamily: 'Montserrat', // Use Montserrat font
                backgroundColor: 'primary', // Set background color
                color: '#000', // Set text color to white
                '&.Mui-selected': {
                  backgroundColor: '#8BD3E6',
                  color: '#fff', // Darker shade for selected state
                },
                '&:hover': {
                  backgroundColor: '#FFEE8C', // Slightly lighter shade on hover
                },
              },
            }}
          />
          </Box>
        </Box>
      </Box>
    </>
  );
}
