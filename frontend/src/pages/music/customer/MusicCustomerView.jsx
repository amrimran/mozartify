import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Switch,
  FormControlLabel,
  Pagination,
  Skeleton,
  Snackbar,
  Alert,
  PaginationItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CustomerSidebar from "./MusicCustomerSidebar";
import { createGlobalStyle } from "styled-components";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import abcjs from "abcjs";
import { Play, Pause, RotateCw } from "lucide-react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import StarIcon from "@mui/icons-material/Star";
import Rating from "@mui/material/Rating";

export default function CustomerMusicScoreView() {
  const { id } = useParams();
  const [abcContent, setAbcContent] = useState("");
  const [metadata, setMetadata] = useState(null);
  const [user, setUser] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [synthesizer, setSynthesizer] = useState(null);

  const [musicScore, setMusicScore] = useState();
  const [favorites, setFavorites] = useState([]);
  const [addedToCartScores, setAddedToCartScores] = useState([]);
  const navigate = useNavigate();

  const [visualObj, setVisualObj] = useState(null);
  const [tempo, setTempo] = useState(100);
  const [isLooping, setIsLooping] = useState(false);
  const [isStop, setIsStop] = useState(false);
  const [transposition, setTransposition] = useState(0);
  const [instrument, setInstrument] = useState(0);
  const [timingCallbacks, setTimingCallbacks] = useState(null);
  const [splitContent, setSplitContent] = useState([]);
  const [page, setPage] = useState(1);
  const abcContainerRef = useRef(null);

  const [purchaseExists, setPurchaseExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(loading);
  const [isRated, setIsRated] = useState(false);
  const [ratingGiven, setRatingGiven] = useState(null);
  const [ratingHover, setRatingHover] = useState(-1); // Store the hover value

  const [showRatingInput, setShowRatingInput] = useState(false); // Toggle visibility of rating input
  const [openTempoDialog, setOpenTempoDialog] = useState(false);
  const [openTransposeDialog, setOpenTransposeDialog] = useState(false);
  const [openLoopDialog, setOpenLoopDialog] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "", // Add this to handle snackbar type (e.g., "cart", "favorite", etc.)
  });

  const ratingLabels = {
    0.5: "Poor",
    1: "Fair",
    1.5: "Okay",
    2: "Average",
    2.5: "Good",
    3: "Very Good",
    3.5: "Excellent",
    4: "Amazing",
    4.5: "Outstanding",
    5: "Perfect",
  };

  const dialogStyles = {
    dialogPaper: {
      borderRadius: "16px",
      padding: "10px",
      fontFamily: "Montserrat",
    },
    title: {
      fontFamily: "Montserrat",
      fontWeight: "bold",
      fontSize: "20px",
      textAlign: "center",
    },
    content: {
      fontFamily: "Montserrat",
      textAlign: "center",
    },
    contentText: {
      fontFamily: "Montserrat",
      fontSize: "16px",
      color: "#555",
    },
    actions: {
      justifyContent: "center",
      gap: "12px",
      marginTop: "8px",
    },
    button: {
      textTransform: "none",
      fontFamily: "Montserrat",
      fontWeight: "bold",
      color: "#FFFFFF",
      backgroundColor: "#8BD3E6",
      border: "1px solid #8BD3E6",
      borderRadius: "8px",
      padding: "8px 24px",
      boxShadow: "none",
      "&:hover": {
        boxShadow: "none",

        backgroundColor: "#6FBCCF",
        borderColor: "#6FBCCF",
      },
    },
    deletebutton: {
      textTransform: "none",
      fontFamily: "Montserrat",
      fontWeight: "bold",
      color: "#FFFFFF",
      backgroundColor: "#DB2226",
      border: "1px solid #DB2226",
      borderRadius: "8px",
      padding: "8px 24px",
      "&:hover": {
        backgroundColor: "#B71C1C",
        borderColor: "#B71C1C",
      },
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
      backgroundColor: "#FFFFFF", // Slightly darker blue for hover
      color: "#8BD3E6", // Keeps the text color consistent
      borderColor: "#6FBCCF", // Matches the background color for cohesion
    },
  };

  const deleteButtonStyles = {
    fontFamily: "Montserrat",
    fontWeight: "bold",
    color: "#FFFFFF",
    border: "1px solid #DB2226",
    borderColor: "#DB2226",
    backgroundColor: "#DB2226",
    width: "250px",
    height: "40px",
    boxShadow: "none",
    "&:hover": {
      boxShadow: "none",
      backgroundColor: "#FFFFFF",
      color: "#DB2226",
      borderColor: "#DB2226",
    },
  };

  const GlobalStyle = createGlobalStyle`
  @keyframes skeleton-wave {
    0% {
        opacity: 1; /* Fully visible */
    }
    50% {
        opacity: 0.2; /* Make it more transparent for higher contrast */
    }
    100% {
        opacity: 1; /* Fully visible */
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

  const handleLockedTempoClick = () => {
    if (!purchaseExists) {
      setOpenTempoDialog(true); // Show the locked feature dialog
    }
  };

  const closeTempoDialog = () => {
    setOpenTempoDialog(false); // Close the dialog
  };

  const handleLockedTransposeClick = () => {
    if (!purchaseExists) {
      setOpenTransposeDialog(true); // Show the locked feature dialog
    }
  };

  const closeTransposeDialog = () => {
    setOpenTransposeDialog(false); // Close the dialog
  };

  const handleLockedLoopClick = () => {
    if (!purchaseExists) {
      setOpenLoopDialog(true); // Show the locked feature dialog
    }
  };

  const closeLoopDialog = () => {
    setOpenLoopDialog(false); // Close the dialog
  };

  const handleSubmitRating = async () => {
    if (ratingGiven > 0) {
      try {
        // Send the rating to the backend
        await axios.post("http://localhost:3000/submit-rating", {
          rating: ratingGiven,
          scoreId: id, // Assuming you have `id` for the music score
          userId: user?._id, // Assuming you have `user._id` available
        });

        // Show a success snackbar
        setSnackbar({
          open: true,
          message: `Thank you for your rating! You rated: ${ratingGiven} stars.`,
          type: "success",
        });

        // Close the floating rating input
        setShowRatingInput(false);

        // Reload the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000); // Adjust delay as needed
      } catch (error) {
        console.error("Error submitting rating:", error);

        // Show an error snackbar
        setSnackbar({
          open: true,
          message: "Failed to submit your rating. Please try again later.",
          type: "error",
        });
      }
    } else {
      // Show an error snackbar if no rating is selected
      setSnackbar({
        open: true,
        message: "Please select a rating before submitting.",
        type: "error",
      });
    }
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

  const instruments = [
    { id: 0, name: "Piano" },
    { id: 1, name: "Acoustic Guitar" },
    { id: 24, name: "Acoustic Guitar (nylon)" },
    { id: 40, name: "Violin" },
    { id: 42, name: "Cello" },
    { id: 52, name: "Choir Aahs" },
    { id: 56, name: "Trumpet" },
    { id: 73, name: "Flute" },
  ];

  const stopAndReset = useCallback(() => {
    if (synthesizer) {
      synthesizer.stop();
    }
    if (timingCallbacks) {
      timingCallbacks.stop();
    }
    setIsPlaying(false);
  }, [synthesizer, timingCallbacks]);

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const response = await axios.get("http://localhost:3000/current-user");
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching the user session:", error);
      }
    };

    const fetchAbcFileAndMetadata = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/abc-file/${id}`
        );
        const abcContent = response.data.content;

        // Extract tempo (Q value) from the ABC content
        const tempoMatch = abcContent.match(/Q:\s*1\/4\s*=\s*(\d+)/);
        const extractedTempo = tempoMatch ? parseInt(tempoMatch[1], 10) : 100;

        setAbcContent(response.data.content);
        setMetadata(response.data);
        setTempo(extractedTempo);

        renderAbc(response.data.content);
      } catch (error) {
        console.error("Error fetching the ABC file and metadata:", error);
      }
    };

    fetchUserSession();
    fetchAbcFileAndMetadata();

    // Cleanup to stop playback on unmount
    return () => {
      stopAndReset(); // Properly invoke the function here
    };
  }, [id]);

  const checkPurchase = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/check-purchase",
        {
          score_id: id,
          user_id: user?._id,
        }
      );

      if (response.status === 200 || response.status === 201) {
        const data = response.data;

        if (data.success) {
          setPurchaseExists(data.exists); // true or false based on backend response
          console.log(
            `Check Purchase: ${data.exists ? "Purchase exists" : "No purchase found"}`
          );

          // Check if ratingGiven is available and set it in state
          if (data.exists && data.data?.length > 0) {
            const rating = data.data[0]?.ratingGiven ?? null; // Extract the ratingGiven value
            setRatingGiven(rating); // Set the ratingGiven value in state
            setIsRated(rating > 0); // Check if ratingGiven > 0 and set isRated
          } else {
            setRatingGiven(null); // If no purchase data, reset ratingGiven
            setIsRated(false); // If no purchase data, set isRated to false
          }
        } else {
          console.error("Unexpected response format:", data);
        }
      } else {
        console.error("Unexpected response from the server:", response.data);
      }
    } catch (error) {
      if (error.response) {
        console.error(
          "Server Error:",
          error.response.data.message || error.response.statusText
        );
      } else if (error.request) {
        console.error("No response received from the server:", error.request);
      } else {
        console.error("Error checking purchase:", error.message);
      }
    } finally {
      setLoading(false); // Always stop loading
    }
  };

  useEffect(() => {
    if (id && user?._id) {
      setLoading(true);
      checkPurchase();
    }
  }, [id, user]);

  useEffect(() => {
    if (!loading) {
      const timeout = setTimeout(() => {
        setShowSkeleton(false); // Hide the Skeleton after 2 seconds
      }, 2000);

      return () => clearTimeout(timeout); // Cleanup timeout on component unmount
    } else {
      setShowSkeleton(true); // Reset to show Skeleton if loading becomes true again
    }
  }, [loading]);

  const transposeAbc = useCallback((abc, semitones) => {
    if (!abc) return abc;
    const lines = abc.split("\n");
    return lines
      .map((line) => {
        if (line.match(/^[A-Za-z]:/)) return line;
        return line.replace(/[A-Ga-g][\',]*/g, (match) => {
          const note = match[0];
          const octave = match.slice(1);
          const noteIndex = "CCDDEFFGGAABc".indexOf(note.toUpperCase());
          const newIndex = (noteIndex + semitones + 12) % 12;
          const newNote = "CCDDEFFGGAABc"[newIndex];
          return newNote + octave;
        });
      })
      .join("\n");
  }, []);

  const renderAbc = useCallback((abcNotation) => {
    if (!abcjs) return;

    // Render the music notation
    const renderOptions = {
      add_classes: true,
      responsive: "resize",
      paddingbottom: 30,
      paddingright: 30,
      selectionColor: "#ff6b6b",
    };

    const visual = abcjs.renderAbc(
      "abc-container",
      abcNotation,
      renderOptions
    )[0];
    setVisualObj(visual);

    // Create new timing callbacks without highlighting
    const newTimingCallbacks = new abcjs.TimingCallbacks(visual, {
      beatCallback: function () {},
      eventCallback: function (event) {
        // Remove highlighting functionality
      },
    });

    setTimingCallbacks(newTimingCallbacks);
  }, []);

  useEffect(() => {
    if (abcContent) {
      const transposedAbc = transposeAbc(abcContent, transposition);
      renderAbc(transposedAbc);
    }
  }, [transposition, abcContent, renderAbc, transposeAbc]);

  useEffect(() => {
    stopAndReset();
  }, [tempo, isLooping, transposition, instrument, stopAndReset, isStop]);

  const handlePlayback = async () => {
    if (!visualObj) return;

    if (!isPlaying) {
      const audioContext = new (window.AudioContext || window.AudioContext)();

      const startPlayback = async () => {
        try {
          const newSynth = new abcjs.synth.CreateSynth();
          setSynthesizer(newSynth);

          await newSynth.init({
            audioContext,
            visualObj,
            millisecondsPerMeasure: (60000 / (tempo * 1.1667)) * 4,
            options: {
              soundFontUrl:
                "https://paulrosen.github.io/midi-js-soundfonts/abcjs/",
              program: instrument,
              onEnded: async () => {
                if (isLooping && !isStop) {
                  // Clean up the old synthesizer
                  newSynth.stop();
                  setSynthesizer(null);
                  // Start a new playback
                  await startPlayback();
                } else {
                  stopAndReset();
                  setIsStop(false);
                }
              },
            },
          });

          await newSynth.prime();

          // Start playback
          if (!isPlaying) {
            setIsPlaying(true);
            setIsStop(false);
          }

          timingCallbacks?.start();

          // If purchaseExists is false, limit playback to half the duration
          if (purchaseExists === false) {
            const totalTime = newSynth.duration; // Get the total duration of the music in seconds
            const halfTime = totalTime / 2; // Calculate half the duration
            newSynth.start(); // Start playback
            setTimeout(() => {
              newSynth.stop(); // Stop playback after half the duration
              setIsPlaying(false);
            }, halfTime * 1000); // Convert seconds to milliseconds
          } else {
            await newSynth.start(); // Full playback if purchaseExists is true
          }
        } catch (error) {
          console.error("Playback error:", error);
          stopAndReset();
          setIsStop(false);
        }
      };

      // Start the initial playback
      await startPlayback();
    } else {
      stopAndReset();
      setIsStop(false);
    }
  };

  useEffect(() => {
    if (abcContent) {
      const lines = abcContent.split("\n");
      const maxLinesPerPage = 20; // Adjust this value as needed
      const pages = [];
      for (let i = 0; i < lines.length; i += maxLinesPerPage) {
        pages.push(lines.slice(i, i + maxLinesPerPage).join("\n"));
      }
      setSplitContent(pages);
    }
  }, [abcContent]);

  const handlePageChange = (event, value) => {
    setPage(value);

    // Reset main page scroll
    window.scrollTo({ top: 100, behavior: "smooth" });

    // Reset ABC container scroll
    if (abcContainerRef.current) {
      abcContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (splitContent[page - 1]) {
      const renderOptions = {
        add_classes: true,
        responsive: "resize",
        paddingbottom: 20,
        paddingright: 20,
        staffwidth: 740,
        scale: 1.2,
      };

      abcjs.renderAbc("abc-container", splitContent[page - 1], renderOptions);

      // Reset ABC container scroll after rendering
      if (abcContainerRef.current) {
        abcContainerRef.current.scrollTop = 0;
      }
    }
  }, [splitContent, page]);

  const handleBackClick = () => {
    navigate("/music-customer/customer-homepage");
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

  const addToCart = async (id) => {
    try {
      await axios.post("http://localhost:3000/add-to-cart", {
        musicScoreId: id,
      });
      setAddedToCartScores([...addedToCartScores, id]);
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

  return (
    <>
      <GlobalStyle />
      <Box sx={{ display: "flex" }}>
        <CustomerSidebar active="library" />
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            padding: 5,
            marginLeft: "229px",
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
              {showSkeleton ? (
                <Skeleton variant="text" width={300} height={40} />
              ) : (
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: "Montserrat",
                    fontWeight: "bold",
                  }}
                >
                  {purchaseExists === false
                    ? "Music Score Preview"
                    : "Music Score View"}
                </Typography>
              )}
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
                    Loading ...
                  </Typography>
                  <Avatar>L</Avatar>
                </>
              )}
            </Box>
          </Box>
          <Divider sx={{ ml: 2, mb: 2 }} />

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
              gap: 4,
              width: "100%",
            }}
          >
            {/* Title and Price group */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 3,
              }}
            >
              {showSkeleton ? (
                <Skeleton variant="text" width={200} height={50} />
              ) : (
                <Typography
                  variant="h6"
                  sx={{
                    maxWidth: "400px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontFamily: "Montserrat",
                  }}
                >
                  Title: <strong>{metadata?.title}</strong>
                </Typography>
              )}

              {purchaseExists === false && (
                <>
                  {showSkeleton ? (
                    <Skeleton variant="text" width={100} height={50} />
                  ) : (
                    <Typography variant="h6" sx={{ fontFamily: "Montserrat" }}>
                      Price:{" "}
                      <strong>
                        RM{" "}
                        {metadata?.price
                          ? Number(metadata.price).toFixed(2)
                          : "0.00"}
                      </strong>
                    </Typography>
                  )}
                </>
              )}
            </Box>

            <Divider orientation="vertical" flexItem sx={{ height: "40px" }} />

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 2,
              }}
            >
              {showSkeleton ? (
                <Skeleton variant="text" width={100} height={50} />
              ) : (
                <Button
                  variant="contained"
                  startIcon={<FavoriteIcon />}
                  onClick={(e) => {
                    toggleFavorite(id);
                  }}
                  sx={{
                    ...deleteButtonStyles,
                  }}
                >
                  {user?.favorites?.includes(id)
                    ? "Added to Favorites"
                    : "Favorites"}
                </Button>
              )}

              {purchaseExists === false ? (
                showSkeleton ? (
                  <Skeleton variant="text" width={150} height={50} />
                ) : addedToCartScores.includes(id) ? (
                  // "Added to Cart" Button
                  <Button
                    variant="contained"
                    startIcon={<ShoppingCartIcon />}
                    sx={{
                      px: 5,
                      fontFamily: "Montserrat",
                      fontWeight: "bold",
                      color: "#FFFFFF",
                      backgroundColor: "#4CAF50", // Green background for added items
                      "&:hover": {
                        backgroundColor: "#388E3C", // Darker green for hover
                      },
                    }}
                    disabled // Prevent further interaction with this button
                  >
                    Added to Cart
                  </Button>
                ) : (
                  // "Add to Cart" Button
                  <Button
                    variant="contained"
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => addToCart(id)}
                    sx={{
                      ...buttonStyles,
                      px: 5, // Preserve original styles
                    }}
                  >
                    Add to Cart
                  </Button>
                )
              ) : isRated === false ? (
                showSkeleton ? (
                  <Skeleton variant="text" width={150} height={50} />
                ) : (
                  <Box sx={{ position: "relative" }}>
                    {/* Rating Button */}
                    <Button
                      variant="contained"
                      startIcon={<StarIcon />}
                      onClick={() => {
                        setShowRatingInput((prev) => !prev); // Toggle the visibility of the rating input
                      }}
                      sx={{
                        fontFamily: "Montserrat",
                        fontWeight: "bold",
                        border: "1px solid #FFD700",
                        backgroundColor: "#FFD700", // Yellow background
                        color: "#FFFFFF", // White text
                        boxShadow: "none",
                        px: 10,
                        position: "relative",
                        zIndex: 1, // Ensure button stays above floating input
                        "&:hover": {
                          boxShadow: "none",
                          backgroundColor: "#FFFFFF", // White background on hover
                          color: "#FFD700", // Yellow text on hover
                        },
                      }}
                    >
                      Rate
                    </Button>

                    {/* Floating Rating Input */}
                    {showRatingInput && (
                      <Box
                        sx={{
                          position: "absolute", // Floating positioning
                          top: "110%", // Position below the button
                          left: "50%",
                          transform: "translateX(-50%)", // Center horizontally
                          zIndex: 999, // Ensure it's above everything else
                          backgroundColor: "#FFFFFF", // White background
                          border: "1px solid #DDD", // Light border
                          borderRadius: "8px",
                          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Subtle shadow
                          padding: "16px", // Add padding for the floating box
                          width: "300px", // Fixed width
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ fontFamily: "Montserrat" }}
                        >
                          Select your rating:
                        </Typography>

                        {/* Rating Component */}
                        <Rating
                          name="hover-feedback"
                          value={ratingGiven} // Persist the selected rating
                          precision={0.5} // Allows half-star ratings
                          onChange={(event, newValue) => {
                            setRatingGiven(newValue); // Update rating value on selection
                          }}
                          onChangeActive={(event, newHover) => {
                            setRatingHover(newHover); // Update hover state
                          }}
                          emptyIcon={
                            <StarIcon
                              style={{ opacity: 0.55 }}
                              fontSize="inherit"
                            />
                          }
                        />
                        {ratingGiven !== null && (
                          <Box
                            sx={{
                              mt: 1,
                              fontFamily: "Montserrat",
                              fontSize: "0.9rem",
                            }}
                          >
                            {
                              ratingLabels[
                                ratingHover !== -1 ? ratingHover : ratingGiven
                              ]
                            }{" "}
                            {/* Display guide text */}
                          </Box>
                        )}

                        <Button
                          variant="contained"
                          onClick={handleSubmitRating}
                          sx={{
                            mt: 2,
                            ...buttonStyles,
                          }}
                        >
                          Submit
                        </Button>
                      </Box>
                    )}
                  </Box>
                )
              ) : showSkeleton ? (
                <Skeleton variant="text" width={150} height={50} />
              ) : (
                <Button
                  variant="contained"
                  startIcon={<StarIcon sx={{ color: "#FFD700" }} />}
                  sx={{
                    fontFamily: "Montserrat",
                    fontWeight: "bold",
                    border: "1px solid #000000", // Black border
                    backgroundColor: "#000000", // Black background
                    color: "#FFD700", // Yellow text
                    boxShadow: "none",
                    px: 10,
                    cursor: "default", // Non-interactive for the "Rated" state
                    "&:hover": {
                      boxShadow: "none", // No hover animation
                      backgroundColor: "#000000", // Keep black background
                      color: "#FFD700", // Keep yellow text
                    },
                  }}
                >
                  {ratingGiven}/5
                </Button>
              )}
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 4 }}>
            {/* Music Score Preview */}
            <Card
              sx={{
                flexGrow: 1,
                p: 3,
                backgroundColor: "#F8F8F8",
                borderRadius: 2,
                maxWidth: "800px",
              }}
            >
              <Box sx={{ bgcolor: "#FFFFFF", borderRadius: 2, p: 2 }}>
                {/* Controls Container */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    flexWrap: "wrap",
                    padding: 2,
                    backgroundColor: "#F8F8F8",
                    borderRadius: 1,
                    mb: 2,
                  }}
                >
                  <Box display="flex" gap={1}>
                    {/* Play Button */}
                    <Button
                      onClick={handlePlayback}
                      variant="contained"
                      sx={{
                        ...buttonStyles,

                        minWidth: "auto", // Button size fits icon
                        padding: "8px", // Adjust padding for smaller button
                      }}
                    >
                      <PlayArrowIcon />
                    </Button>

                    {/* Stop Button */}
                    <Button
                      onClick={() => {
                        setIsStop(true);
                        stopAndReset();
                      }}
                      variant="contained"
                      sx={{
                        ...buttonStyles,

                        minWidth: "auto", // Button size fits icon
                        padding: "8px", // Adjust padding for smaller button
                      }}
                    >
                      <StopIcon />
                    </Button>
                  </Box>

                  {/* Loop Switch */}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isLooping}
                        onChange={(e) => {
                          if (!purchaseExists) {
                            handleLockedLoopClick(); // Open dialog if feature is locked
                          } else {
                            setIsLooping(e.target.checked); // Enable/disable looping if purchased
                          }
                        }}
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "#8BD3E6", // Set the switch thumb color when checked
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            {
                              backgroundColor: "#8BD3E6", // Set the switch track color when checked
                            },
                        }}
                      />
                    }
                    label="Loop"
                    sx={{
                      "& .MuiFormControlLabel-label": {
                        fontFamily: "Montserrat",
                        fontWeight: "bold", // Make the label typography bold
                      },
                    }}
                  />

                  {/* Dialog for Loop */}
                  <Dialog open={openLoopDialog} onClose={closeLoopDialog}>
                    <DialogTitle
                      sx={{
                        fontFamily: "Montserrat",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      Feature Locked
                    </DialogTitle>
                    <DialogContent
                      sx={{
                        fontFamily: "Montserrat",
                        display: "flex", // Enable flexbox
                        flexDirection: "column", // Arrange children vertically
                        justifyContent: "center", // Center children vertically
                        alignItems: "center", // Center children horizontally
                        textAlign: "center", // Center text alignment
                      }}
                    >
                      <Typography>
                        The loop feature is locked until you purchase this
                        score. Once purchased, you can enable the loop
                        functionality as desired.
                      </Typography>
                    </DialogContent>
                    <DialogActions
                      sx={{
                        display: "flex", // Enable flexbox
                        justifyContent: "center", // Center children horizontally
                        alignItems: "center", // Center children vertically (not necessary for buttons, but for alignment consistency)
                      }}
                    >
                      <Button
                        onClick={closeLoopDialog}
                        sx={{
                          fontFamily: "Montserrat",
                          fontWeight: "bold",
                          color: "#FFFFFF",
                          backgroundColor: "#8BD3E6",
                          "&:hover": { backgroundColor: "#6FBCCF" },
                        }}
                      >
                        OK
                      </Button>
                    </DialogActions>
                  </Dialog>

                  {/* Tempo Controls */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography
                      sx={{ fontFamily: "Montserrat", fontWeight: "bold" }}
                    >
                      Tempo:
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0, // No gap between controls
                        border: "1px solid rgba(0, 0, 0, 0.23)", // Optional: border for group
                        borderRadius: 1, // Rounded corners for group
                        overflow: "hidden", // Ensures clean edges
                      }}
                    >
                      <Button
                        onClick={() => {
                          if (purchaseExists) {
                            setTempo((prev) => Math.max(40, prev - 1)); // Decrease tempo if unlocked
                          } else {
                            handleLockedTempoClick(); // Show dialog for locked feature
                          }
                        }}
                        variant="outlined"
                        size="small"
                        sx={{
                          minWidth: 40,
                          borderRadius: 0, // Removes individual button corners
                          border: "none", // Removes individual button border
                          "&:hover": {
                            border: "none", // Prevents border from appearing on hover
                            backgroundColor: "#F8F8F8", // Forces white background on hover
                          },
                        }}
                      >
                        -
                      </Button>
                      <TextField
                        value={tempo}
                        disabled={!purchaseExists} // Disable tempo editing if locked
                        size="small"
                        variant="outlined"
                        sx={{
                          maxWidth: 55,
                          textAlign: "center",
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none", // Removes TextField border for group cohesion
                          },
                          "& .MuiInputBase-input.Mui-disabled": {
                            WebkitTextFillColor: "#000", // Overrides text color when disabled
                          },
                        }}
                        inputProps={{
                          style: { textAlign: "center" }, // Centers the input text
                        }}
                      />
                      <Button
                        onClick={() => {
                          if (purchaseExists) {
                            setTempo((prev) => Math.min(200, prev + 1)); // Increase tempo if unlocked
                          } else {
                            handleLockedTempoClick(); // Show dialog for locked feature
                          }
                        }}
                        variant="outlined"
                        size="small"
                        sx={{
                          minWidth: 40,
                          borderRadius: 0, // Removes individual button corners
                          border: "none", // Removes individual button border
                          "&:hover": {
                            border: "none", // Prevents border from appearing on hover
                            backgroundColor: "#F8F8F8", // Forces white background on hover
                          },
                        }}
                      >
                        +
                      </Button>
                    </Box>
                    <Typography sx={{ fontFamily: "Montserrat" }}>
                      BPM
                    </Typography>

                    {/* Dialog for Locked Feature */}
                    <Dialog
                      open={openTempoDialog}
                      onClose={closeTempoDialog}
                      PaperProps={{
                        sx: dialogStyles.dialogPaper,
                      }}
                    >
                      <DialogTitle
                        sx={{
                          ...dialogStyles.title,
                        }}
                      >
                        Feature Locked
                      </DialogTitle>
                      <DialogContent
                        sx={{
                          ...dialogStyles.content,
                        }}
                      >
                        <Typography
                          sx={{
                            ...dialogStyles.contentText,
                          }}
                        >
                          The tempo feature is locked until you purchase this
                          score. Once purchased, you can adjust the tempo from{" "}
                          <strong>
                            <u>40 BPM</u>
                          </strong>{" "}
                          to{" "}
                          <strong>
                            <u>200 BPM</u>
                          </strong>
                          .
                        </Typography>
                      </DialogContent>
                      <DialogActions
                        sx={{
                          ...dialogStyles.actions,
                        }}
                      >
                        <Button
                          onClick={closeTempoDialog}
                          sx={{
                            ...dialogStyles.button,
                          }}
                        >
                          OK
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </Box>

                  {/* Transpose Controls */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography
                      sx={{ fontFamily: "Montserrat", fontWeight: "bold" }}
                    >
                      Transpose:
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0, // No gap between controls
                        border: "1px solid rgba(0, 0, 0, 0.23)", // Optional: border for group
                        borderRadius: 1, // Rounded corners for group
                        overflow: "hidden", // Ensures clean edges
                      }}
                    >
                      <Button
                        onClick={() => {
                          if (!purchaseExists) {
                            handleLockedTransposeClick(); // Open dialog if the feature is locked
                          } else {
                            setTransposition((prev) => Math.max(-12, prev - 1)); // Decrease transpose
                          }
                        }}
                        variant="outlined"
                        size="small"
                        sx={{
                          minWidth: 40,
                          borderRadius: 0, // Removes individual button corners
                          border: "none", // Removes individual button border
                          "&:hover": {
                            border: "none", // Prevents border from appearing on hover
                            backgroundColor: "#F8F8F8", // Forces white background on hover
                          },
                        }}
                      >
                        -
                      </Button>
                      <TextField
                        disabled
                        value={transposition}
                        size="small"
                        variant="outlined"
                        sx={{
                          maxWidth: 55,
                          textAlign: "center",
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none", // Removes TextField border for group cohesion
                          },
                          "& .MuiInputBase-input.Mui-disabled": {
                            WebkitTextFillColor: "#000", // Overrides text color when disabled
                          },
                        }}
                        inputProps={{
                          style: { textAlign: "center" }, // Centers the input text
                        }}
                      />
                      <Button
                        onClick={() => {
                          if (!purchaseExists) {
                            handleLockedTransposeClick(); // Open dialog if the feature is locked
                          } else {
                            setTransposition((prev) => Math.min(12, prev + 1)); // Increase transpose
                          }
                        }}
                        variant="outlined"
                        size="small"
                        sx={{
                          minWidth: 40,
                          borderRadius: 0, // Removes individual button corners
                          border: "none", // Removes individual button border
                          "&:hover": {
                            border: "none", // Prevents border from appearing on hover
                            backgroundColor: "#F8F8F8", // Forces white background on hover
                          },
                        }}
                      >
                        +
                      </Button>
                    </Box>
                    <Typography sx={{ fontFamily: "Montserrat" }}>
                      semitones
                    </Typography>

                    {/* Dialog for Transpose */}
                    <Dialog
                      open={openTransposeDialog}
                      onClose={closeTransposeDialog}
                    >
                      <DialogTitle
                        sx={{
                          fontFamily: "Montserrat",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        Feature Locked
                      </DialogTitle>
                      <DialogContent
                        sx={{
                          fontFamily: "Montserrat",
                          display: "flex", // Enable flexbox
                          flexDirection: "column", // Arrange children vertically
                          justifyContent: "center", // Center children vertically
                          alignItems: "center", // Center children horizontally
                          textAlign: "center", // Center text alignment
                        }}
                      >
                        <Typography>
                          The transpose feature is locked until you purchase
                          this score. Once purchased, you can adjust the
                          transpose from{" "}
                          <strong>
                            <u>-12 semitones</u>
                          </strong>{" "}
                          to{" "}
                          <strong>
                            <u>+12 semitones</u>
                          </strong>
                          .
                        </Typography>
                      </DialogContent>
                      <DialogActions
                        sx={{
                          display: "flex", // Enable flexbox
                          justifyContent: "center", // Center children horizontally
                          alignItems: "center", // Center children vertically (not necessary for buttons, but for alignment consistency)
                        }}
                      >
                        <Button
                          onClick={closeTransposeDialog}
                          sx={{
                            fontFamily: "Montserrat",
                            fontWeight: "bold",
                            color: "#FFFFFF",
                            backgroundColor: "#8BD3E6",
                            "&:hover": { backgroundColor: "#6FBCCF" },
                          }}
                        >
                          OK
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </Box>

                  {/* Instrument Selection */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Typography
                      sx={{ fontFamily: "Montserrat", fontWeight: "bold" }}
                    >
                      Instrument:
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <Select
                        value={instrument}
                        onChange={(e) =>
                          setInstrument(parseInt(e.target.value))
                        }
                        sx={{
                          fontFamily: "Montserrat", // Apply Montserrat font to the dropdown
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              fontFamily: "Montserrat", // Apply font style to dropdown items
                            },
                          },
                        }}
                      >
                        {instruments.map((inst) => (
                          <MenuItem
                            key={inst.id}
                            value={inst.id}
                            disabled={!purchaseExists && inst.id !== 0} // Disable all options except Piano if purchaseExists is false
                            sx={{
                              fontFamily: "Montserrat", // Apply Montserrat font to menu items
                              display: "flex",
                              justifyContent: "space-between", // Space between name and message
                            }}
                          >
                            <span>{inst.name}</span>
                            {!purchaseExists && inst.id !== 0 && (
                              <Typography
                                variant="caption"
                                sx={{
                                  fontStyle: "italic",
                                  color: "gray", // Text color for the message
                                  ml: 2,
                                }}
                              >
                                purchase to unlock more
                              </Typography>
                            )}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                {/* ABC notation container with fixed height */}
                <Box
                  ref={abcContainerRef}
                  sx={{
                    height: "600px",
                    overflowY: "auto",
                    border: "1px solid #eee",
                    borderRadius: "4px",
                    p: 2,
                    scrollBehavior: "smooth", // Add smooth scrolling
                  }}
                >
                  {abcContent ? (
                    <div id="abc-container" style={{ width: "100%" }}>
                      {/* ABC notation will be rendered here */}
                    </div>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "Montserrat" }}
                    >
                      Loading music score...
                    </Typography>
                  )}
                </Box>
              </Box>
            </Card>

            {/* Music Score Details */}
            {metadata ? (
              <Card
                sx={{
                  width: 200,
                  p: 2,
                  backgroundColor: "#F8F8F8",
                  borderRadius: 2,
                  height: "auto",
                  maxHeight: "850px",
                  overflowY: "auto",
                  flexGrow: 1,
                }}
              >
                <CardContent
                  sx={{ bgcolor: "#FFFFFF", borderRadius: 2, p: 0, pl: -1 }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Montserrat", // Use Montserrat font
                      textAlign: "center", // Center-align the text horizontally
                      paddingTop: 2, // Add padding at the top (in theme spacing units)
                      fontWeight: "bold", // Make it bold
                      fontSize: "1.25rem", // Increase font size (adjust as needed)
                    }}
                  >
                    Description
                  </Typography>

                  <List>
                    {/* Reordered Fields */}
                    <ListItem>
                      <ListItemText
                        primary="Title"
                        secondary={metadata.title || "N/A"}
                        primaryTypographyProps={{
                          sx: { fontFamily: "Montserrat", fontWeight: "bold" },
                        }}
                        secondaryTypographyProps={{
                          sx: { fontFamily: "Montserrat" },
                        }}
                        sx={{ p: 1 }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Artist"
                        secondary={metadata.artist || "N/A"}
                        primaryTypographyProps={{
                          sx: { fontFamily: "Montserrat", fontWeight: "bold" },
                        }}
                        secondaryTypographyProps={{
                          sx: { fontFamily: "Montserrat" },
                        }}
                        sx={{ p: 1 }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Composer"
                        secondary={metadata.composer || "N/A"}
                        primaryTypographyProps={{
                          sx: { fontFamily: "Montserrat", fontWeight: "bold" },
                        }}
                        secondaryTypographyProps={{
                          sx: { fontFamily: "Montserrat" },
                        }}
                        sx={{ p: 1 }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Genre"
                        secondary={metadata.genre || "N/A"}
                        primaryTypographyProps={{
                          sx: { fontFamily: "Montserrat", fontWeight: "bold" },
                        }}
                        secondaryTypographyProps={{
                          sx: { fontFamily: "Montserrat" },
                        }}
                        sx={{ p: 1 }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Instrumentation"
                        secondary={metadata.instrumentation || "N/A"}
                        primaryTypographyProps={{
                          sx: { fontFamily: "Montserrat", fontWeight: "bold" },
                        }}
                        secondaryTypographyProps={{
                          sx: { fontFamily: "Montserrat" },
                        }}
                        sx={{ p: 1 }}
                      />
                    </ListItem>

                    {/* Remaining Fields */}

                    {Object.keys(metadata)
                      .filter(
                        (key) =>
                          ![
                            "title",
                            "artist",
                            "composer",
                            "genre",
                            "instrumentation",
                            "content",
                            "__v",
                            "_id",
                            "filename",
                            "coverImageUrl",
                            "deleted",
                            "mp3FileName",
                            "mp3FileUrl",
                            "downloadEvents",
                          ].includes(key)
                      )
                      .sort((a, b) => a.localeCompare(b)) // Sort keys alphabetically
                      .map((key) => {
                        // Format date fields
                        let value = metadata[key];
                        if (
                          [
                            "dateAccessioned",
                            "dateAvailable",
                            "dateIssued",
                            "dateOfBirth",
                            "dateOfComposition",
                            "dateOfCreation",
                            "dateOfRecording",
                            "lastModified",
                            "dateUploaded",
                          ].includes(key) &&
                          value
                        ) {
                          value = new Date(value).toLocaleDateString("en-GB"); // Format to dd/MM/yyyy
                        }

                        // Prepend "RM" for price-related fields
                        if (["price"].includes(key.toLowerCase()) && value) {
                          value = `RM ${value}`;
                        }

                        return (
                          <ListItem key={key}>
                            <ListItemText
                              primary={key
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                              secondary={value || "N/A"}
                              primaryTypographyProps={{
                                sx: {
                                  fontFamily: "Montserrat",
                                  fontWeight: "bold",
                                },
                              }}
                              secondaryTypographyProps={{
                                sx: { fontFamily: "Montserrat" },
                              }}
                              sx={{ p: 1 }}
                            />
                          </ListItem>
                        );
                      })}
                  </List>
                </CardContent>
              </Card>
            ) : (
              <Typography variant="body2" sx={{ fontFamily: "Montserrat" }}>
                Loading metadata...
              </Typography>
            )}
          </Box>

          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={splitContent.length} // Show all pages
              page={page}
              onChange={(event, value) => {
                if (purchaseExists || value === 1) {
                  handlePageChange(event, value); // Allow navigation only if purchaseExists or to the first page
                }
              }}
              color="primary"
              renderItem={(item) => (
                <PaginationItem
                  {...item}
                  disabled={!purchaseExists && item.page !== 1} // Disable pages except the first if purchaseExists is false
                  sx={{
                    borderRadius: 2,
                    fontFamily: "Montserrat",
                    backgroundColor: "primary",
                    color: item.disabled ? "gray" : "#000", // Gray color for disabled items
                    "&.Mui-selected": {
                      backgroundColor: "#8BD3E6",
                      color: "#fff",
                    },
                    "&:hover": {
                      backgroundColor: item.disabled
                        ? "transparent"
                        : "#FFEE8C", // No hover effect for disabled items
                    },
                  }}
                />
              )}
            />
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
      </Box>
    </>
  );
}
