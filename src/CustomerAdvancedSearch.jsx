import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Avatar,
  Divider,
  Box,
  List,
  Snackbar,
  Alert,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Container,
  Typography,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Grid,
  InputLabel,
  FormControl,
  Pagination,
} from "@mui/material";
import { Favorite, PlayArrow } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import CustomerSidebar from "./CustomerSidebar";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";

export default function CustomerAdvancedSearch() {
  const [user, setUser] = useState(null); //store user's information

  //store ui component state
  const [selectedTab, setSelectedTab] = useState(0);

  //advanced query builder
  const [selectedCollection, setSelectedCollection] = useState("All");
  const [searchCategory, setSearchCategory] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [searchLogic, setSearchLogic] = useState("AND");
  const [searchInputs, setSearchInputs] = useState([]);

  //search functionalities
  const [searchResults, setSearchResults] = useState([]); //store list of music scores after a search
  const [hasSearched, setHasSearched] = useState(false); // store the events whether the search has been triggered or not
  const [filteredResults, setFilteredResults] = useState([]);
  const [hasFiltered, setHasFiltered] = useState(false);

  const [favorites, setFavorites] = useState([]); //store list of user's favorite music scores
  const [addedToCartScores, setAddedToCartScores] = useState([]); //store list of user's favorite music scores
  const [purchasedScores, setPurchasedScores] = useState([]); //store list of user's purchased music scores

  const [showSearchResults, setShowSearchResults] = useState(false);

  const [page, setPage] = useState(1); // Track the current page
  const itemsPerPage = 5; // Number of items per page

  const navigate = useNavigate();

  //search results refine items
  const [selectedComposers, setselectedComposers] = useState([]);
  const [selectedGenres, setselectedGenres] = useState([]);
  const [selectedInstruments, setselectedInstruments] = useState([]);
  const [selectedEmotions, setselectedEmotions] = useState([]);
  const [queryPreview, setQueryPreview] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "", // Add this to handle snackbar type (e.g., "cart", "favorite", etc.)
  });

  // Replace the hardcoded lists and add these state variables at the top of your CustomerSearch component:
  const [genreList, setGenreList] = useState([]);
  const [composerList, setComposerList] = useState([]);
  const [instrumentationList, setInstrumentationList] = useState([]); // Changed from instrumentList
  const [emotionList, setEmotionList] = useState([]);

  // Add this useEffect hook after your other useEffect hooks:
  useEffect(() => {
    const fetchRefineLists = async () => {
      try {
        const response = await axios.get("http://localhost:3000/refine-search");
        const { composers, genres, emotions, instrumentation } = response.data;

        setComposerList(composers);
        setGenreList(genres);
        setEmotionList(emotions);
        setInstrumentationList(instrumentation); // Changed from instruments
      } catch (error) {
        console.error("Error fetching refine search lists:", error);
      }
    };

    fetchRefineLists();
  }, []);

  const buttonStyles2 = {
    px: 5,
    fontFamily: "Montserrat",
    fontWeight: "bold",
    color: "#8BD3E6",
    backgroundColor: "#FFFFFF",
    border: "1px solid #8BD3E6",
    borderColor: "#8BD3E6",
    boxShadow: "none",
    "&:hover": {
      boxShadow: "none",
      backgroundColor: "#E6F8FB", // Subtle light blue hover effect
      color: "#7AB9C4", // Slightly darker shade of the text
      borderColor: "#7AB9C4", // Matches the text color for consistency
    },
  };

  const buttonStyles = {
    px: 10,
    fontFamily: "Montserrat",
    fontWeight: "bold",
    color: "#FFFFFF",
    backgroundColor: "#8BD3E6",
    border: "1px solid #8BD3E6",
    borderColor: "#8BD3E6",
    boxShadow: "none",
    "&:hover": {
      boxShadow: "none",
      backgroundColor: "#6FBCCF", // Slightly darker blue for hover
      color: "#FFFFFF", // Keeps the text color consistent
      borderColor: "#6FBCCF", // Matches the background color for cohesion
    },
  };

  //search results refine functions
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleGenreChange = (e) => {
    setselectedGenres(e.target.value);
  };

  const handleComposerChange = (e) => {
    setselectedComposers(e.target.value);
  };

  const handleInstrumentChange = (e) => {
    setselectedInstruments(e.target.value);
  };

  const handleEmotionChange = (e) => {
    setselectedEmotions(e.target.value);
  };

  const handleRefineClick = () => {
    // Check if all four filter categories are empty
    if (
      selectedGenres.length === 0 &&
      selectedComposers.length === 0 &&
      selectedInstruments.length === 0 &&
      selectedEmotions.length === 0
    ) {
      // If all filters are empty, reset the filtered results and set hasFiltered to false
      setFilteredResults([]); // Optional: reset filtered results
      setHasFiltered(false);
      return; // Do nothing if all filters are empty
    }

    // Proceed with filtering if at least one filter is selected
    const results = searchResults.filter((item) => {
      const genreMatch =
        selectedGenres.length === 0 || selectedGenres.includes(item.genre);
      const composerMatch =
        selectedComposers.length === 0 ||
        selectedComposers.includes(item.composer);
      const instrumentMatch =
        selectedInstruments.length === 0 ||
        selectedInstruments.includes(item.instrumentation);
      const emotionMatch =
        selectedEmotions.length === 0 ||
        selectedEmotions.includes(item.emotion);

      // Return true if all conditions match
      return genreMatch && composerMatch && instrumentMatch && emotionMatch;
    });

    // Store the filtered results in the state
    setFilteredResults(results);
    setHasFiltered(true); // Set hasFiltered to true after applying filters
  };

  const clearQueryPreview = () => {
    setQueryPreview("");
    setSearchInputs([]);
  };

  const handleClearFilters = () => {
    setSelectedGenres([]);
    setSelectedComposers([]);
    setSelectedInstruments([]);
    setSelectedEmotions([]);
    setHasFiltered(false);
  };

  const paginatedResults = (
    hasFiltered ? filteredResults : searchResults
  ).slice((page - 1) * itemsPerPage, page * itemsPerPage);

  //advanced search query builder variables
  const collectionOptions = ["All", "Lecturers", "Students", "Freelancers"];

  const metadataItems = [
    { code: "All", label: "All" },
    { code: "AB", label: "Albums" },
    { code: "AT", label: "Alternative Title" },
    { code: "AR", label: "Artist(s)" },
    { code: "BR", label: "Background Resources" },
    { code: "CN", label: "Call number" },
    { code: "CO", label: "Composer" },
    { code: "CT", label: "Composer Time Period" },
    { code: "C", label: "Contributor" },
    { code: "CR", label: "Copyright" },
    { code: "CS", label: "Cosmetics and Prop" },
    { code: "CY", label: "County" },
    { code: "CR", label: "Creator" },
    { code: "DA", label: "Date Accessioned" },
    { code: "DV", label: "Date Available" },
    { code: "DI", label: "Date Issued" },
    { code: "DB", label: "Date of Birth" },
    { code: "DC", label: "Date of Creation" },
    { code: "DR", label: "Date of Recording (medium)" },
    { code: "DS", label: "Description" },
    { code: "DCN", label: "Digital Collection" },
    { code: "ED", label: "Edition" },
    { code: "E", label: "Editor" },
    { code: "EG", label: "Ethnic Group" },
    { code: "FP", label: "First Publication" },
    { code: "FM", label: "Format" },
    { code: "GS", label: "Gamut Scale" },
    { code: "GN", label: "Genre" },
    { code: "HC", label: "Historical Context" },
    { code: "ID", label: "Identifier" },
    { code: "IN", label: "Instrumentation" },
    { code: "IT", label: "Intonation" },
    { code: "K", label: "Key" },
    { code: "L", label: "Language" },
    { code: "LM", label: "Last Modified" },
    { code: "LE", label: "Length" },
    { code: "LI", label: "Librettist" },
    { code: "LY", label: "Lyrics" },
    { code: "MC", label: "Melodic Classification" },
    { code: "MD", label: "Melody Descriptions" },
    { code: "MI", label: "Method of implementation" },
    { code: "MN", label: "Misc. Notes" },
    { code: "MS", label: "Movements/Sections" },
    { code: "NT", label: "Notation" },
    { code: "NIP", label: "Number in publication" },
    { code: "OC", label: "Object Collections" },
    { code: "OP", label: "Occasion of Performing" },
    { code: "PS", label: "Performing Skills" },
    { code: "PL", label: "Permalink" },
    { code: "PT", label: "Piece Style" },
    { code: "PB", label: "Place of Birth" },
    { code: "PO", label: "Place of Origin" },
    { code: "PSP", label: "Place of Prosper" },
    { code: "PR", label: "Place of Residence" },
    { code: "P", label: "Position" },
    { code: "PV", label: "Prevalence" },
    { code: "PU", label: "Publisher" },
    { code: "PC", label: "Purpose of Creation" },
    { code: "RP", label: "Recording Person" },
    { code: "RE", label: "Region" },
    { code: "RA", label: "Related Artists" },
    { code: "RW", label: "Related Work" },
    { code: "RT", label: "Rights" },
    { code: "SM", label: "Sheet Music" },
    { code: "SP", label: "Sponsor" },
    { code: "ST", label: "Stage Performance" },
    { code: "SU", label: "Subject" },
    { code: "TA", label: "Target Audience" },
    { code: "TE", label: "Temperament" },
    { code: "TO", label: "Time of Origin" },
    { code: "TP", label: "Time of Prosper" },
    { code: "TT", label: "Title" },
    { code: "TF", label: "Track function" },
    { code: "TK", label: "Tracks" },
    { code: "TY", label: "Type" },
    { code: "URI", label: "URI" },
    { code: "VS", label: "Vocal Style" },
    { code: "WP", label: "Western Parallel" },
    { code: "WT", label: "Work Title" },
    { code: "YDC", label: "Year/Date of Composition" },
  ];

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const [sortOption, setSortOption] = useState("default");

  // Sort metadataItems based on the selected sort option
  const sortedMetadataItems = [...metadataItems]; // Create a shallow copy of the array
  if (sortOption === "alphabetical") {
    sortedMetadataItems.sort((a, b) => a.label.localeCompare(b.label));
  }
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
  }, [navigate]);

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

  const fetchMusicScores = async (combinedQueries, selectedCollection) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/advanced-search",
        {
          combinedQueries,
          selectedCollection,
        }
      );
      setSearchResults(response.data); // Set the search results
      setHasSearched(true); // Mark that a search has been performed
      setShowSearchResults(true); // Show the search results
    } catch (error) {
      console.error("Error fetching music scores:", error);
    }
  };

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
      setSnackbar({
        open: true,
        message: "Added to cart successfully!",
        type: "cart",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const toggleFavorite = async (musicScoreId) => {
    try {
      const isFavorite = user?.favorites?.includes(musicScoreId);

      const response = await axios.post("http://localhost:3000/set-favorites", {
        musicScoreId,
        action: isFavorite ? "remove" : "add", // Explicitly specify the action
      });
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
      setFavorites(response.data.favorites);
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  const getButtonText = (category, selectedItems) => {
    return `${category}: ${
      selectedItems.length > 0 ? selectedItems.join(", ") : "None"
    }`;
  };

  const generateQueryPreview = (inputs) => {
    return inputs
      .map((input, index) => {
        const abbreviation =
          metadataItems.find((item) => item.label === input.searchCategory)
            ?.code || "";
        if (index === 0) {
          return `${abbreviation}=(${input.searchText})`; // First query: (searchCategory):(searchText)
        }
        return `${input.searchLogic} ${abbreviation}=(${input.searchText})`; // Subsequent queries: (searchLogic)(searchCategory):(searchText)
      })
      .join(" "); // Join all parts with spaces
  };

  const handleAddInput = () => {
    const newInput = {
      searchCategory,
      searchText,
      searchLogic,
    };
    setSearchInputs([...searchInputs, newInput]);
    setSearchCategory("All");
    setSearchText("");
    setQueryPreview(generateQueryPreview([...searchInputs, newInput]));
  };

  const handleQueryPreviewChange = (event) => {
    setQueryPreview(event.target.value);
  };

  const parseQueryPreview = (queryPreview) => {
    // This pattern matches each query in the format `Category=(Text)` or `Category=(Text) AND/OR ...`
    const regex = /(\w+)=\(([^)]+)\)/g;
    let match;
    const combinedQueries = [];

    let prevSearchLogic = ""; // Track the previous search logic (AND, OR, NOT)

    // Loop through the query preview to match all the queries
    while ((match = regex.exec(queryPreview)) !== null) {
      const [fullMatch, categoryCode, searchText] = match;

      // Clean up any spaces around the search text
      const cleanSearchText = searchText.trim();

      // Find the category label based on the category code (if it exists in metadataItems)
      const categoryMatch = metadataItems.find(
        (item) => item.code === categoryCode
      );

      const queryObj = {
        searchCategory: categoryMatch ? categoryMatch.label : categoryCode,
        searchText: cleanSearchText,
      };

      // Attach searchLogic for the subsequent queries
      if (prevSearchLogic) {
        queryObj.searchLogic = prevSearchLogic;
      }

      // After the current query, check for logical operators (AND, OR, NOT)
      const nextChar = queryPreview.slice(regex.lastIndex).trim();
      if (
        nextChar.startsWith("AND") ||
        nextChar.startsWith("OR") ||
        nextChar.startsWith("NOT")
      ) {
        prevSearchLogic = nextChar.split(" ")[0]; // Set the search logic (AND, OR, NOT)
        regex.lastIndex += prevSearchLogic.length + 1; // Skip over the logic
      } else {
        prevSearchLogic = ""; // Reset searchLogic for the last query
      }

      combinedQueries.push(queryObj);
    }

    return combinedQueries;
  };
  const handleSearch = () => {
    const combinedQueries = parseQueryPreview(queryPreview);

    setShowSearchResults(true); // change from basic search to search result on main section

    fetchMusicScores(combinedQueries, selectedCollection); //send the queries and selected collection to function that connects with middleware
  }; //remove the logic attribute of the first items in the array

  const handleCategoryChange = (e) => {
    setSearchCategory(e.target.value);
  };
  const handleTextChange = (e) => {
    setSearchText(e.target.value); // Update the state with the new text
  };
  const handleLogicChange = (e) => {
    setSearchLogic(e.target.value);
  };

  const handleToggleSearchResults = () => {
    setShowSearchResults(!showSearchResults); // Toggle the visibility of the search results
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
      <Box sx={{ display: "flex", minHeight: "100vh", maxHeight: "100vh" }}>
        <CustomerSidebar active="search" />

        {/* Parent for header and main content */}
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            display: "flex",
            flexDirection: "column",
            marginLeft: "229px",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "Montserrat",
                  fontWeight: "bold",
                  mt: 4,
                  ml: 1,
                }}
              >
                Advanced Music Score Search Query Builder
              </Typography>{" "}
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
          <Divider sx={{ mt: 1 }} />

          {/* Main Section*/}

          {/*Main Section  when no Search is done */}
          {!showSearchResults && (
            <Container maxWidth="lg" sx={{ mt: 2 }}>
              <Box
                sx={{
                  backgroundColor: "#fcfcfc",
                  borderRadius: 2,
                  p: 4,
                  boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.16)", // Added elevation
                  border: "1px solid rgba(0, 0, 0, 0.12)", // Added subtle border
                }}
              >
                <Box sx={{ backgroundColor: "white", padding: 3 }}>
                  <Box
                    sx={{
                      border: "1px solid",
                      borderColor: "#8bd3e6",
                      padding: 2,
                      display: "inline-block",
                      borderRadius: 3,
                    }}
                  >
                    <Typography
                      variant="body1"
                      color="black"
                      sx={{
                        fontFamily: "Montserrat, sans-serif",
                        display: "inline",
                      }}
                    >
                      Search in:
                    </Typography>

                    <Select
                      value={selectedCollection}
                      onChange={(e) => setSelectedCollection(e.target.value)}
                      variant="standard"
                      sx={{
                        marginLeft: "10px",
                        border: "none",
                        outline: "none",
                        fontFamily: "'Montserrat', sans-serif",
                        "& .MuiSelect-select": {
                          padding: 0,
                          fontWeight: "bold",
                        },
                        "& .MuiSelect-icon": {
                          display: "none",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          display: "none",
                        },
                        "&:hover:not(.Mui-disabled):before": {
                          borderBottom: "2px solid #8BD3E6",
                        },
                        "&:focus-within:before": {
                          borderBottom: "2px solid #8BD3E6",
                        },
                      }}
                    >
                      <MenuItem
                        value="All"
                        sx={{
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                      >
                        All
                      </MenuItem>
                      <MenuItem
                        value="Lecturers"
                        sx={{
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                      >
                        Lecturers
                      </MenuItem>
                      <MenuItem
                        value="Students"
                        sx={{
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                      >
                        Students
                      </MenuItem>
                      <MenuItem
                        value="Freelancers"
                        sx={{
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                      >
                        Freelancers
                      </MenuItem>
                    </Select>
                  </Box>

                  {/* Search Query Row Component */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mt: 2,
                      gap: 2,
                    }}
                  >
                    <Select
                      value={searchCategory}
                      onChange={handleCategoryChange}
                      variant="outlined"
                      sx={{
                        width: "100px",
                        fontFamily: "Montserrat, sans-serif",
                        fontWeight: "bold",
                        borderRadius: 3, // Set border radius here
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#8BD3E6", // Default border color
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#67ADC1", // Border color on hover
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#67ADC1", // Border color when focused
                        },
                      }}
                    >
                      <MenuItem
                        value="All"
                        sx={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        All
                      </MenuItem>
                      <MenuItem
                        value="Title"
                        sx={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        Title
                      </MenuItem>
                      <MenuItem
                        value="Genre"
                        sx={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        Genre
                      </MenuItem>
                      <MenuItem
                        value="Composer"
                        sx={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        Composer
                      </MenuItem>
                      <MenuItem
                        value="Instrumentation"
                        sx={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        Instrumentation
                      </MenuItem>
                      <MenuItem
                        value="Emotion"
                        sx={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        Emotion
                      </MenuItem>
                    </Select>

                    <TextField
                      variant="outlined"
                      placeholder="Place your search text here ..."
                      value={searchText}
                      onChange={handleTextChange}
                      sx={{
                        flex: 1,
                        "& .MuiOutlinedInput-root": {
                          fontFamily: "Montserrat",
                          borderRadius: 3, // Set border radius here
                          "& fieldset": {
                            borderColor: "#8BD3E6",
                          },
                          "&:hover fieldset": {
                            borderColor: "#67ADC1",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#67ADC1",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontFamily: "Montserrat",
                        },
                      }}
                    />

                    <Select
                      value={searchLogic}
                      onChange={handleLogicChange}
                      variant="outlined"
                      sx={{
                        width: "100px",
                        fontFamily: "Montserrat, sans-serif",
                        fontWeight: "bold",
                        borderRadius: 3, // Set border radius here
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#8BD3E6", // Default border color
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#67ADC1", // Border color on hover
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#67ADC1", // Border color when focused
                        },
                      }}
                    >
                      <MenuItem
                        value="AND"
                        sx={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        AND
                      </MenuItem>
                      <MenuItem
                        value="OR"
                        sx={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        OR
                      </MenuItem>
                      <MenuItem
                        value="NOT"
                        sx={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        NOT
                      </MenuItem>
                    </Select>

                    <Button
                      onClick={handleAddInput}
                      variant="contained"
                      startIcon={<AddIcon />}
                      sx={{
                        paddingTop: 2,
                        paddingBottom: 2,
                        color: "white",
                        backgroundColor: "#78BBCC",
                        fontFamily: "Montserrat, sans-serif",
                        boxShadow: "none",
                        "&:hover": {
                          backgroundColor: "#67ADC1",
                          boxShadow: "none",
                        },
                      }}
                    >
                      ADD TO QUERY
                    </Button>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      paddingTop: 3,
                      paddingLeft: 2,
                      paddingRight: 2,
                      mt: 2,
                      gap: 2,
                    }}
                  >
                    <Grid container spacing={3}>
                      {/* Left Grid */}
                      <Grid item xs={12} sm={6}>
                        <Typography
                          sx={{ fontFamily: "Montserrat, sans-serif" }}
                        >
                          Query Preview
                        </Typography>
                        <Box
                          sx={{
                            borderBottom: "0.5px solid #67ADC1",
                            width: "100%",
                            mt: 0.5,
                            mb: 2,
                          }}
                        />
                        <TextField
                          multiline
                          rows={4}
                          variant="outlined"
                          fullWidth
                          placeholder="Place your query here ..."
                          value={queryPreview}
                          onChange={handleQueryPreviewChange}
                          sx={{
                            flex: 1,
                            "& .MuiOutlinedInput-root": {
                              fontFamily: "Montserrat",
                              borderRadius: 3, // Set border radius here
                              "& fieldset": {
                                borderColor: "#8BD3E6",
                              },
                              "&:hover fieldset": {
                                borderColor: "#67ADC1",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#67ADC1",
                              },
                            },
                            "& .MuiInputLabel-root": {
                              fontFamily: "Montserrat",
                            },
                            mb: 3,
                          }}
                        />

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          {/* <Button
                                variant="outlined"
                                sx={{
                                  fontFamily: "Montserrat, sans-serif",
                                  borderColor: "#67ADC1", // Border color stays the same
                                  color: "#67ADC1", // Ensure the text color is white
                                  "&:hover": {
                                    borderColor: "#67ADC1", // Border color stays the same on hover
                                  },
                                }}
                              >
                                Add Date Range
                              </Button> */}
                          <Box sx={{ display: "flex", gap: 2 }}>
                            <Button
                              variant="outlined"
                              sx={buttonStyles2}
                              onClick={clearQueryPreview}
                            >
                              Clear
                            </Button>
                            <Button
                              variant="contained"
                              onClick={handleSearch}
                              disabled={!queryPreview}
                              startIcon={<SearchIcon />} // Add the search icon
                              sx={buttonStyles}
                            >
                              Search
                            </Button>
                          </Box>
                        </Box>
                      </Grid>

                      {/* Right Grid */}
                      <Grid item xs={12} sm={6}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingLeft: 2, // Add padding at the start (left)
                            paddingRight: 2, // Add padding at the end (right)
                          }}
                        >
                          <Typography
                            sx={{ fontFamily: "Montserrat, sans-serif" }}
                          >
                            <span style={{ fontWeight: "bold" }}>Boolean:</span>{" "}
                            AND, OR, NOT
                          </Typography>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              sx={{
                                fontFamily: "Montserrat, sans-serif",
                                fontWeight: "bold", // Make the text bold
                              }}
                            >
                              Field Tags:
                            </Typography>
                            <Select
                              defaultValue="default"
                              value={sortOption}
                              onChange={(e) => setSortOption(e.target.value)}
                              variant="outlined"
                              sx={{
                                marginLeft: 2,
                                fontFamily: "Montserrat, sans-serif",
                                height: "36px", // Adjust the height of the Select component
                                "& .MuiInputBase-root": {
                                  height: "100%", // Consistent height for the input area
                                  padding: "0 12px", // Padding inside the input box
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderRadius: "4px", // Custom border radius
                                  borderColor: "#8BD3E6", // Optional: Light blue border by default
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#8BD3E6", // Light blue border on hover
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: "#8BD3E6", // Light blue border on focus
                                  },
                              }}
                            >
                              <MenuItem
                                value="default"
                                sx={{
                                  fontFamily: "Montserrat, sans-serif",
                                }}
                              >
                                Default
                              </MenuItem>
                              <MenuItem
                                value="alphabetical"
                                sx={{
                                  fontFamily: "Montserrat, sans-serif",
                                }}
                              >
                                Alphabetical
                              </MenuItem>
                            </Select>
                          </Box>
                        </Box>

                        <Box sx={{ mt: 1 }}>
                          <Typography
                            sx={{
                              fontFamily: "Montserrat, sans-serif",
                              fontWeight: "bold", // Make the text bold
                              textAlign: "center",
                              marginBottom: 1, // Add margin bottom
                            }}
                          >
                            Metadata
                          </Typography>

                          <Box
                            sx={{
                              maxHeight: "200px", // Set a maximum height for the scrollable area
                              overflowY: "auto", // Enable vertical scrolling
                              display: "grid", // Use grid layout
                              gridTemplateColumns: "repeat(3, 1fr)", // Three equal columns
                              gap: 2, // Space between columns
                              listStyleType: "none", // Remove default list styling
                              paddingLeft: 5, // Add padding at the start (left)
                              paddingRight: 5, // Add padding at the end (right)
                              fontSize: "0.8rem", // Make text smaller (adjust as needed)
                            }}
                          >
                            {sortedMetadataItems.map((item, index) => (
                              <li key={index} style={{ marginBottom: "10px" }}>
                                <div
                                  style={{
                                    fontWeight: "bold",
                                    fontFamily: "Montserrat, sans-serif",
                                  }}
                                >
                                  {item.code}
                                </div>
                                <div>{item.label}</div>
                              </li>
                            ))}
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </Box>
            </Container>
          )}
          {/* Advanced Search Component End */}

          {/* Search Result Component Start */}
          {showSearchResults && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: 2,
                mt: 1,
                ml: 2,
              }}
            >
              <Button
                variant="contained"
                onClick={handleToggleSearchResults}
                startIcon={<ArrowBackIcon />}
                sx={buttonStyles2}
              >
                Back
              </Button>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 2,
                  overflowX: "auto",
                  flexGrow: 1,
                  maxWidth: "50vw",
                }}
              >
                {hasFiltered && selectedGenres.length > 0 && (
                  <Button
                    sx={{
                      backgroundColor: "#A2DCEB",
                      color: "white",
                      borderRadius: 50,
                      padding: "8px 16px",
                      textTransform: "none",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      whiteSpace: "nowrap",
                      fontFamily: "Montserrat",
                    }}
                    disabled
                  >
                    {getButtonText("Genre", selectedGenres)}
                  </Button>
                )}

                {hasFiltered && selectedComposers.length > 0 && (
                  <Button
                    sx={{
                      backgroundColor: "#A2DCEB",
                      color: "white",
                      borderRadius: 50,
                      padding: "8px 16px",
                      textTransform: "none",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      whiteSpace: "nowrap",
                      fontFamily: "Montserrat",
                    }}
                    disabled
                  >
                    {getButtonText("Composer", selectedComposers)}
                  </Button>
                )}

                {hasFiltered && selectedInstruments.length > 0 && (
                  <Button
                    sx={{
                      backgroundColor: "#A2DCEB",
                      color: "white",
                      borderRadius: 50,
                      padding: "8px 16px",
                      textTransform: "none",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      whiteSpace: "nowrap",
                      fontFamily: "Montserrat",
                    }}
                    disabled
                  >
                    {getButtonText("Instrumentation", selectedInstruments)}
                  </Button>
                )}

                {hasFiltered && selectedEmotions.length > 0 && (
                  <Button
                    sx={{
                      backgroundColor: "#A2DCEB",
                      color: "white",
                      borderRadius: 50,
                      padding: "8px 16px",
                      textTransform: "none",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      whiteSpace: "nowrap",
                      fontFamily: "Montserrat",
                    }}
                    disabled
                  >
                    {getButtonText("Emotion", selectedEmotions)}
                  </Button>
                )}
              </Box>
            </Box>
          )}

          {showSearchResults && (
            <Box
              sx={{
                flexGrow: 1,
                height: "calc(100vh - 200px)",
                width: "100%",
                overflow: "hidden",
                p: 2,
              }}
            >
              {/* Main content grid */}
              <Grid
                container
                spacing={2}
                sx={{ flexGrow: 1, overflow: "hidden" }}
              >
                {/* Refine search sidebar */}
                <Grid item xs={3}>
                  <Box
                    sx={{
                      p: 2,
                      border: "1px solid #ddd",
                      borderRadius: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontFamily: "Montserrat", textAlign: "center" }}
                    >
                      Refine Your Search
                    </Typography>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel sx={{ fontFamily: "Montserrat" }}>
                        Genre
                      </InputLabel>
                      <Select
                        multiple
                        value={selectedGenres}
                        onChange={handleGenreChange}
                        label="Genre"
                        renderValue={(selected) => selected.join(", ")}
                        sx={{
                          borderRadius: "16px",
                          fontFamily: "Montserrat",
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#8BD3E6",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#8BD3E6",
                          },
                        }}
                      >
                        {genreList.map((genre) => (
                          <MenuItem
                            key={genre}
                            value={genre}
                            sx={{ fontFamily: "Montserrat" }}
                          >
                            {genre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel sx={{ fontFamily: "Montserrat" }}>
                        Composer
                      </InputLabel>
                      <Select
                        multiple
                        value={selectedComposers}
                        onChange={handleComposerChange}
                        label="Composer"
                        renderValue={(selected) => selected.join(", ")}
                        sx={{
                          borderRadius: "16px",
                          fontFamily: "Montserrat",
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#8BD3E6",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#8BD3E6",
                          },
                        }}
                      >
                        {composerList.map((composer) => (
                          <MenuItem
                            key={composer}
                            value={composer}
                            sx={{ fontFamily: "Montserrat" }}
                          >
                            {composer}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel sx={{ fontFamily: "Montserrat" }}>
                        Instrumentation
                      </InputLabel>
                      <Select
                        multiple
                        value={selectedInstruments}
                        onChange={handleInstrumentChange}
                        label="Instrumentation"
                        renderValue={(selected) => selected.join(", ")}
                        sx={{
                          borderRadius: "16px",
                          fontFamily: "Montserrat",
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#8BD3E6",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#8BD3E6",
                          },
                        }}
                      >
                        {instrumentationList.map((instrument) => (
                          <MenuItem
                            key={instrument}
                            value={instrument}
                            sx={{ fontFamily: "Montserrat" }}
                          >
                            {instrument}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel sx={{ fontFamily: "Montserrat" }}>
                        Emotion
                      </InputLabel>
                      <Select
                        multiple
                        value={selectedEmotions}
                        onChange={handleEmotionChange}
                        label="Emotion"
                        renderValue={(selected) => selected.join(", ")}
                        sx={{
                          borderRadius: "16px",
                          fontFamily: "Montserrat",
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#8BD3E6",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#8BD3E6",
                          },
                        }}
                      >
                        {emotionList.map((emotion) => (
                          <MenuItem
                            key={emotion}
                            value={emotion}
                            sx={{ fontFamily: "Montserrat" }}
                          >
                            {emotion}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Box sx={{ flexGrow: 1 }} />
                    {/* Add Clear Refine button */}
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={handleClearFilters}
                      sx={{ ...buttonStyles2, mb: 2 }}
                    >
                      Clear
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleRefineClick}
                      sx={buttonStyles}
                    >
                      Refine
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={9}>
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {" "}
                    {paginatedResults.length === 0 && hasSearched && (
                      <Typography
                        variant="body1"
                        sx={{ fontFamily: "Montserrat" }}
                      >
                        No results found
                      </Typography>
                    )}
                    {paginatedResults.length > 0 && (
                      <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
                        <List>
                          {paginatedResults.map((item) => (
                            <ListItemButton
                              key={item._id}
                              onClick={() =>
                                navigate(
                                  `/customer-library/customer-music-score-view/${item._id}`
                                )
                              }
                            >
                              <ListItemText
                                primary={
                                  <Typography
                                    sx={{
                                      fontFamily: "Montserrat",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {item.title}
                                  </Typography>
                                }
                                secondary={
                                  <Typography
                                    variant="body2"
                                    sx={{ fontFamily: "Montserrat" }}
                                  >
                                    {`Genre: ${item.genre} | Composer: ${item.composer} | Artist: ${item.artist}`}
                                  </Typography>
                                }
                              />

                              <ListItemIcon>
                                {!purchasedScores.includes(item._id) &&
                                  !addedToCartScores.includes(item._id) && (
                                    <IconButton
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addToCart(item._id);
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
                                    toggleFavorite(item._id);
                                  }}
                                >
                                  <Favorite
                                    color={
                                      favorites.includes(item._id)
                                        ? "error"
                                        : "disabled"
                                    }
                                  />
                                </IconButton>
                              </ListItemIcon>
                            </ListItemButton>
                          ))}
                        </List>

                        <Box sx={{ mt: "auto", py: 2 }}>
                          <Pagination
                            count={Math.ceil(
                              (hasFiltered
                                ? filteredResults.length
                                : searchResults.length) / itemsPerPage
                            )}
                            page={page}
                            onChange={handlePageChange}
                            sx={{
                              mt: 3,
                              display: "flex",
                              justifyContent: "center",
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
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
          {/* Search Result Frontend Component End */}
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
        </Box>
      </Box>
    </>
  );
}
