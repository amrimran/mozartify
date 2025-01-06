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
  InputLabel,
  Switch,
  FormControlLabel,
  Pagination,
  Paper,
} from "@mui/material";
import ClerkSidebar from "./MusicEntryClerkSidebar";
import abcjs from "abcjs";
import { format } from "date-fns";
import { Play, Pause, RotateCw } from "lucide-react";

export default function ClerkMusicScoreView() {
  const { scoreId } = useParams();
  const [abcContent, setAbcContent] = useState("");
  const [metadata, setMetadata] = useState(null);
  const [user, setUser] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [synthesizer, setSynthesizer] = useState(null);
  const [visualObj, setVisualObj] = useState(null);
  const [tempo, setTempo] = useState(100);
  const [isLooping, setIsLooping] = useState(false);
  const [transposition, setTransposition] = useState(0);
  const [instrument, setInstrument] = useState(0);
  const [timingCallbacks, setTimingCallbacks] = useState(null);
  const [splitContent, setSplitContent] = useState([]);
  const [page, setPage] = useState(1);
  const abcContainerRef = useRef(null);

  const navigate = useNavigate();

  const buttonStyles = {
    px: 15,
    fontFamily: "Montserrat",
    fontWeight: "bold",
    color: "#FFFFFF",
    backgroundColor: "#8BD3E6",
    border: "1px solid #8BD3E6", // Explicitly define the border
    borderColor: "#8BD3E6",
    "&:hover": {
      backgroundColor: "#3B3183",
      color: "#FFFFFF",
      border: "1px solid #3B3183", // Ensure border remains visible on hover
      borderColor: "#3B3183",
    },
  };

  const deleteButtonStyles = {
    fontFamily: "Montserrat",
    fontWeight: "bold",
    color: "#FFFFFF",
    borderColor: "#DB2226",
    backgroundColor: "#DB2226",
    width: "250px",
    height: "40px",
    "&:hover": {
      backgroundColor: "#FFFFFF",
      color: "#DB2226",
      borderColor: "#DB2226",
    },
  };

  const instruments = [
    { id: 0, name: "Piano" },
    { id: 1, name: "Acoustic Guitar" },
    { id: 24, name: "Acoustic Guitar (nylon)" },
    { id: 40, name: "Violin" },
    { id: 42, name: "Cello" },
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
          `http://localhost:3001/abc-file/${scoreId}`
        );
        const abcContent = response.data.content;

        // Extract tempo (Q value) from the ABC content
        const tempoMatch = abcContent.match(/Q:\s*1\/4\s*=\s*(\d+)/); // Match 'Q: 1/4=120' or similar
        const extractedTempo = tempoMatch ? parseInt(tempoMatch[1], 10) : 100; // Default to 100 if not found

        setAbcContent(response.data.content);
        setMetadata(response.data);
        setTempo(extractedTempo); // Dynamically set the tempo

        renderAbc(response.data.content);
      } catch (error) {
        console.error("Error fetching the ABC file and metadata:", error);
      }
    };

    fetchUserSession();
    fetchAbcFileAndMetadata();
    // Cleanup
    return () => {
      stopAndReset();
    };
  }, [scoreId]);

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

  // Effect to handle changes in manipulation controls
  useEffect(() => {
    stopAndReset();
  }, [tempo, isLooping, transposition, instrument, stopAndReset]);

  const handlePlayback = async () => {
    if (!visualObj) return;

    if (!isPlaying) {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      try {
        // Initialize the synthesizer
        const newSynth = new abcjs.synth.CreateSynth();
        setSynthesizer(newSynth);

        await newSynth.init({
          audioContext,
          visualObj,
          millisecondsPerMeasure: (60000 / (tempo * 1.1667)) * 4,
          options: {
            soundFontUrl:
              "https://paulrosen.github.io/midi-js-soundfonts/abcjs/",
            program: instrument, // MIDI instrument program
          },
        });

        await newSynth.prime();

        setIsPlaying(true);

        // Start playback
        timingCallbacks?.start();
        await newSynth.start();

        // Set a manual timeout for playback duration
        // Set up ended callback
        newSynth.addEventListener("ended", () => {
          if (isLooping) {
            handlePlayback();
          } else {
            stopAndReset();
          }
        });
      } catch (error) {
        console.error("Playback error:", error);
        stopAndReset();
      }
    } else {
      stopAndReset();
    }
  };

  // Split ABC content into pages
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

  // Modify the handlePageChange function to reset both scrolls
  const handlePageChange = (event, value) => {
    setPage(value);

    // Reset main page scroll
    window.scrollTo({ top: 100, behavior: "smooth" });

    // Reset ABC container scroll
    if (abcContainerRef.current) {
      abcContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Modify the page rendering effect to also reset scroll
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
    navigate("/clerk-homepage");
  };

  const handleEditMusicScoreClick = () => {
    if (metadata && metadata.filename) {
      navigate("/clerk-edit", { state: { fileName: metadata.filename } });
    } else {
      console.error("Filename is not available");
    }
  };

  const handleDeleteClick = () => {
    if (!metadata || !metadata.filename) {
      console.error("No metadata or filename available");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this music score?"
    );
    if (!confirmDelete) {
      return; // Exit if the user cancels the action
    }

    fetch("http://localhost:3001/catalog", {
      // Replace with the correct backend URL
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename: metadata.filename, // Use metadata to get the filename
        deleted: true, // Mark the file as deleted
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json(); // Parse the JSON from the response
      })
      .then((data) => {
        if (data.message === "Metadata saved successfully") {
          // Redirect or update the UI after successful deletion
          navigate("/clerk-homepage"); // Redirect to the homepage or handle UI update
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        sx={{
          width: 225,
          bgcolor: "#3B3183",
          flexShrink: 0,
          overflowY: "auto",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <ClerkSidebar active="manageScore" disableActiveTab />
      </Box>
      <Box sx={{ flexGrow: 1, p: 3, pl: 31 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontFamily: "Montserrat", fontWeight: "bold", mt: 2, ml: 1 }}
          >
            Manage Music Scores
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="body1"
              sx={{ mr: 2, fontFamily: "Montserrat" }}
            >
              {user ? user.username : "Guest"}
            </Typography>
            <Avatar
              alt={user?.username}
              src={user && user.profile_picture ? user.profile_picture : null}
            >
              {(!user || !user.profile_picture) &&
                user?.username.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", gap: 4 }}>
          {/* Music Score Preview */}
          <Card
            sx={{
              flexGrow: 1,
              p: 3,
              bgcolor: "#F2F2F5",
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
                {/* Play/Stop Button */}
                <Button
                  onClick={handlePlayback}
                  variant="contained"
                  startIcon={isPlaying ? <Pause /> : <Play />}
                  sx={{
                    bgcolor: "#3B3183",
                    "&:hover": { bgcolor: "#2A2355" },
                    fontFamily: "Montserrat",
                    px: 3,
                  }}
                >
                  {isPlaying ? "Stop" : "Play"}
                </Button>

                {/* Loop Switch */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={isLooping}
                      onChange={(e) => setIsLooping(e.target.checked)}
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
                  <Button
                    onClick={() => setTempo((prev) => Math.max(40, prev - 1))}
                    variant="outlined"
                    size="small"
                    sx={{ minWidth: 40 }}
                  >
                    -
                  </Button>
                  <TextField
                    value={tempo}
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value, 10);
                      if (
                        !isNaN(newValue) &&
                        newValue >= 40 &&
                        newValue <= 200
                      ) {
                        setTempo(newValue);
                      }
                    }}
                    size="small"
                    variant="outlined"
                    sx={{ maxWidth: 60 }}
                  />
                  <Button
                    onClick={() => setTempo((prev) => Math.min(200, prev + 1))}
                    variant="outlined"
                    size="small"
                    sx={{ minWidth: 40 }}
                  >
                    +
                  </Button>
                  <Typography sx={{ fontFamily: "Montserrat" }}>BPM</Typography>
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
                  <Button
                    onClick={() =>
                      setTransposition((prev) => Math.max(-12, prev - 1))
                    }
                    variant="outlined"
                    size="small"
                    sx={{ minWidth: 40 }}
                  >
                    -
                  </Button>
                  <TextField
                    value={transposition}
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value, 10);
                      if (
                        !isNaN(newValue) &&
                        newValue >= -12 &&
                        newValue <= 12
                      ) {
                        setTransposition(newValue);
                      }
                    }}
                    size="small"
                    variant="outlined"
                    sx={{ maxWidth: 45 }}
                  />
                  <Button
                    onClick={() =>
                      setTransposition((prev) => Math.min(12, prev + 1))
                    }
                    variant="outlined"
                    size="small"
                    sx={{ minWidth: 40 }}
                  >
                    +
                  </Button>
                  <Typography sx={{ fontFamily: "Montserrat" }}>
                    semitones
                  </Typography>
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
                      onChange={(e) => setInstrument(parseInt(e.target.value))}
                      sx={{
                        fontFamily: "Montserrat", // Apply Montserrat font to the dropdown
                      }}
                    >
                      {instruments.map((inst) => (
                        <MenuItem
                          key={inst.id}
                          value={inst.id}
                          sx={{
                            fontFamily: "Montserrat", // Apply Montserrat font to menu items
                          }}
                        >
                          {inst.name}
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
                  <Typography variant="body2" sx={{ fontFamily: "Montserrat" }}>
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
                bgcolor: "#F2F2F5",
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

        {/* Pagination with better spacing */}
        <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={splitContent.length}
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

        <Box sx={{ mt: 4, display: "flex", justifyContent: "center", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleBackClick}
            sx={buttonStyles}
          >
            Back
          </Button>
          <Button
            variant="outlined"
            onClick={handleEditMusicScoreClick}
            sx={buttonStyles}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            onClick={handleDeleteClick} // Directly call the delete handler
            sx={deleteButtonStyles}
          >
            Delete
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
