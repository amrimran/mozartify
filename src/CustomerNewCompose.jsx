import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Avatar,
  Divider,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  AppBar,
  Toolbar,
  Drawer,
  useMediaQuery,
  Grid,
  Paper,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Delete,
  Save,
  PlayArrow,
  Stop,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import CustomerSidebar from "./CustomerSidebar";
import { Link } from "react-router-dom";
import Vex from "vexflow";
import * as Tone from "tone";
const API_BASE_URL = import.meta.env.VITE_API_URL;

import { createTheme, ThemeProvider } from "@mui/material/styles";

// Constants
const DRAWER_WIDTH = 225;
const VF = Vex;

// Theme setup
const theme = createTheme({
  typography: {
    fontFamily: "Montserrat, Arial, sans-serif",
  },
  breakpoints: {
    values: {
      xs: 0, // mobile phones
      sm: 752, // tablets
      md: 960, // small laptops
      lg: 1280, // desktops
      xl: 1920, // large screens
    },
  },
});

const buttonStyles = {
  px: { xs: 3, sm: 4 },
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
  px: { xs: 3, sm: 4 },
  fontFamily: "Montserrat",
  fontWeight: "bold",
  color: "#8BD3E6",
  backgroundColor: "#FFFFFF",
  border: "1px solid #8BD3E6",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#E6F8FB",
    color: "#7AB9C4",
    borderColor: "#7AB9C4",
    boxShadow: "none",
  },
};

export default function CustomerNewCompose() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [user, setUser] = useState(null);

  const [currentDuration, setCurrentDuration] = useState("q"); // Default to quarter note
  const [currentOctave, setCurrentOctave] = useState(4); // Default octave
  const [notes, setNotes] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const contextRef = useRef(null);
  const synth = useRef(null);

  const navigate = useNavigate();

  const noteMap = {
    55: { note: "f/5", tone: "F5" }, // Space above top line
    60: { note: "e/5", tone: "E5" }, // Top line
    65: { note: "d/5", tone: "D5" }, // Space between top and second line
    70: { note: "c/5", tone: "C5" }, // Second line
    75: { note: "b/4", tone: "B4" }, // Space between second and middle line
    80: { note: "a/4", tone: "A4" }, // Middle line
    85: { note: "g/4", tone: "G4" }, // Space between middle and fourth line
    90: { note: "f/4", tone: "F4" }, // Fourth line
    95: { note: "e/4", tone: "E4" }, // Space between fourth and bottom line
    100: { note: "d/4", tone: "D4" }, // Bottom line
    105: { note: "c/4", tone: "C4" }, // Space below bottom line
    110: { note: "b/3", tone: "B3" }, // Ledger line below staff
    115: { note: "a/3", tone: "A3" }, // Space below ledger line
    120: { note: "g/3", tone: "G3" }, // Second ledger line below staff
  };

  const [selectedInstrument, setSelectedInstrument] = useState("piano");
  const instrumentOptions = [
    { value: "piano", label: "Piano" },
    { value: "synth", label: "Synth" },
    { value: "violin", label: "Violin" },
    { value: "cello", label: "Cello" },
    { value: "flute", label: "Flute" },
    { value: "guitar", label: "Guitar" },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/current-user`);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching current user:", error);
        // Comment the navigate line for testing with dummy data
        // navigate("/login");

        // Set dummy user data for testing
        setUser({
          username: "TestUser",
          profile_picture: null,
        });
      }
    };
    fetchUser();

    // Initialize with default instrument (piano)
    synth.current = new Tone.PolySynth(Tone.Synth).toDestination();

    return () => {
      if (synth.current) {
        synth.current.dispose();
      }
    };
  }, [navigate]);

  // Initialize the staff
  useEffect(() => {
    console.log("Canvas ref initialized:", !!canvasRef.current);
    if (canvasRef.current) {
      initializeStaff();
    }
  }, [canvasRef.current]);

  // Re-render when notes change
  useEffect(() => {
    if (contextRef.current && notes.length > 0) {
      // Work with a copy of the notes array
      const currentNotes = [...notes];
      renderStaffWithNotes(currentNotes);
    }
  }, [notes]);

  const initializeStaff = () => {
    if (canvasRef.current) {
      // Clear previous renderer if it exists
      if (rendererRef.current) {
        canvasRef.current.innerHTML = "";
      }

      // Create new renderer
      rendererRef.current = new VF.Renderer(
        canvasRef.current,
        VF.Renderer.Backends.SVG
      );

      rendererRef.current.resize(600, 250);
      contextRef.current = rendererRef.current.getContext();
      contextRef.current.setFont("Arial", 10);

      // Draw empty staff
      renderStaff();

      console.log("Staff initialized successfully");
    } else {
      console.error("Canvas ref is not available");
    }
  };

  // Render the staff and notes - Simplified to always show all notes
  const renderStaff = () => {
    renderStaffWithNotes([...notes]);
  };

  // Update how notes are added to ensure immediate rendering
  const handleCanvasClick = (event) => {
    // Make sure we have the SVG element
    const svgElement = canvasRef.current?.querySelector("svg");
    if (!svgElement) {
      console.error("SVG element not found");
      return;
    }

    const rect = svgElement.getBoundingClientRect();

    // Get the click position relative to the SVG canvas
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Only process clicks in the staff area (40 to 140px vertically)
    if (y < 40 || y > 140) return;

    // Define staff line positions (5 lines of the staff)
    const staffLines = [60, 70, 80, 90, 100]; // From top to bottom

    // Find the closest line or space
    // First, check if we're directly on a line (within a small tolerance)
    const lineTolerance = 3; // pixels
    let onLine = false;
    let targetPosition = 0;

    for (const linePos of staffLines) {
      if (Math.abs(y - linePos) <= lineTolerance) {
        // Click is on a line
        targetPosition = linePos;
        onLine = true;
        break;
      }
    }

    // If not on a line, find the space between lines
    if (!onLine) {
      // Find the space between lines (or above/below the staff)
      for (let i = 0; i < staffLines.length; i++) {
        const currentLine = staffLines[i];
        const nextLine = staffLines[i + 1];

        if (i === 0 && y < currentLine) {
          // Above the top line
          targetPosition = 55; // Position for the top space above the staff
          break;
        } else if (i === staffLines.length - 1 && y > currentLine) {
          // Below the bottom line
          targetPosition = 105; // Position for the bottom space below the staff
          break;
        } else if (nextLine && y > currentLine && y < nextLine) {
          // Between lines
          targetPosition = Math.round((currentLine + nextLine) / 2);
          break;
        }
      }
    }

    // Map the target position to a note
    const closestPositions = Object.keys(noteMap).map(Number);
    let closestPos = closestPositions.reduce((prev, curr) =>
      Math.abs(curr - targetPosition) < Math.abs(prev - targetPosition)
        ? curr
        : prev
    );

    const noteData = noteMap[closestPos];
    console.log(
      "Adding note:",
      noteData.note,
      "at position:",
      closestPos,
      "Target:",
      targetPosition
    );

    // // Find the closest note position
    // let closestPos = 105; // Default to middle C
    // let minDist = Number.MAX_VALUE;

    // Object.keys(noteMap).forEach((pos) => {
    //   const dist = Math.abs(y - parseInt(pos));
    //   if (dist < minDist) {
    //     minDist = dist;
    //     closestPos = parseInt(pos);
    //   }
    // });

    // const noteData = noteMap[closestPos];
    // console.log("Adding note:", noteData.note, "Duration:", currentDuration);

    // Create a new note with the current duration
    try {
      // const noteData = noteMap[closestPos];
      const newNote = new VF.StaveNote({
        keys: [noteData.note],
        duration: currentDuration,
      });

      // Add note to state with callback to ensure completion
      setNotes((prevNotes) => {
        const updatedNotes = [...prevNotes, newNote];

        // Important: Store a reference to the created notes array
        // This creates a "snapshot" of the notes at this moment
        const notesToRender = [...updatedNotes];

        // Use a slightly longer timeout to ensure state is settled
        setTimeout(() => {
          // Force a complete redraw with the current notes
          renderStaffWithNotes(notesToRender);
        }, 100);

        return updatedNotes;
      });
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  // New function that takes notes as a parameter
  const renderStaffWithNotes = (notesToRender) => {
    console.log("Rendering staff with explicit notes:", notesToRender.length);

    if (!contextRef.current || !canvasRef.current) {
      console.error("Cannot render: context or canvas not available");
      return;
    }

    // Complete reset to ensure clean rendering
    canvasRef.current.innerHTML = "";
    rendererRef.current = new VF.Renderer(
      canvasRef.current,
      VF.Renderer.Backends.SVG
    );
    rendererRef.current.resize(600, 250);
    contextRef.current = rendererRef.current.getContext();
    contextRef.current.setFont("Arial", 10);

    // Create a stave
    const stave = new VF.Stave(10, 15, 550);
    stave.addClef("treble").addTimeSignature("4/4");
    stave.setContext(contextRef.current).draw();

    if (notesToRender.length > 0) {
      try {
        // Create a voice with flexible configuration
        const voice = new VF.Voice({
          num_beats: Math.max(4, notesToRender.length * 4),
          beat_value: 4,
        }).setMode(VF.Voice.Mode.SOFT);

        // Add all notes from the provided array
        voice.addTickables(notesToRender);

        // Format and draw
        const formatter = new VF.Formatter();
        formatter.joinVoices([voice]);
        formatter.formatToStave([voice], stave);

        voice.draw(contextRef.current, stave);
        console.log("Notes drawn successfully:", notesToRender.length);
      } catch (error) {
        console.error("Error rendering staff:", error);
      }
    }
  };

  const handleInstrumentChange = (instrument) => {
    setSelectedInstrument(instrument);

    // Dispose of the old synth
    if (synth.current) {
      synth.current.dispose();
    }

    // Create new synth based on selection
    switch (instrument) {
      case "piano":
        synth.current = new Tone.PolySynth(Tone.Synth).toDestination();
        synth.current.volume.value = -8;
        break;
      case "synth":
        synth.current = new Tone.PolySynth(Tone.FMSynth).toDestination();
        synth.current.volume.value = -12;
        break;
      case "violin":
        synth.current = new Tone.PolySynth(Tone.Synth, {
          oscillator: {
            type: "sine",
          },
          envelope: {
            attack: 0.1,
            decay: 0.1,
            sustain: 0.5,
            release: 1,
          },
        }).toDestination();
        break;
      case "cello":
        synth.current = new Tone.PolySynth(Tone.Synth, {
          oscillator: {
            type: "sawtooth",
          },
          envelope: {
            attack: 0.5,
            decay: 0.1,
            sustain: 0.3,
            release: 1,
          },
        }).toDestination();
        break;
      case "flute":
        synth.current = new Tone.PolySynth(Tone.Synth, {
          oscillator: {
            type: "sine",
          },
          envelope: {
            attack: 0.1,
            decay: 0.1,
            sustain: 0.4,
            release: 0.5,
          },
        }).toDestination();
        break;
      case "guitar":
        synth.current = new Tone.PolySynth(Tone.Synth, {
          oscillator: {
            type: "pulse",
          },
          envelope: {
            attack: 0.01,
            decay: 0.1,
            sustain: 0.1,
            release: 0.1,
          },
        }).toDestination();
        break;
      default:
        synth.current = new Tone.PolySynth(Tone.Synth).toDestination();
    }
  };

  // Clear all notes
  const handleClear = () => {
    stopPlayback();

    // Set notes to empty array
    setNotes([]);

    // Force an immediate canvas clear instead of waiting for state update
    if (contextRef.current) {
      contextRef.current.clear();

      // Redraw empty staff
      const stave = new VF.Stave(10, 15, 550);
      stave.addClef("treble").addTimeSignature("4/4");
      stave.setContext(contextRef.current).draw();
    }
  };

  const convertToAbcNotation = (notes) => {
    // Create header lines individually
    const headerLines = [
      "X: 278",
      "T: My Composition",
      "S: Mozartify Music Composition",
      "N: Transcribed by Mozartify",
      "R: Random",
      "M: 4/4",
      "L: 1/8",
      "K: A",
    ];

    // Join lines without any whitespace
    const header = headerLines.join("\n");

    // Process notes without any chord symbols
    let processedNotes = [];

    notes.forEach((note) => {
      // Extract note name and duration
      const noteName = note.keys[0].split("/")[0].toLowerCase();
      const duration = note.duration;

      // Format note (uppercase for notes above middle C)
      let formattedNote = noteName;
      if (
        note.keys[0].includes("/4") ||
        note.keys[0].includes("/5") ||
        note.keys[0].includes("/6")
      ) {
        formattedNote = formattedNote.toUpperCase();
      }

      // Add duration
      let abcDuration;
      switch (duration) {
        case "w":
          abcDuration = "1";
          break;
        case "h":
          abcDuration = "2";
          break;
        case "q":
          abcDuration = "";
          break;
        case "8":
          abcDuration = "";
          break;
        case "16":
          abcDuration = "/2";
          break;
        case "32":
          abcDuration = "/4";
          break;
        default:
          abcDuration = "";
      }

      // Add the formatted note without any chord symbol
      processedNotes.push(`${formattedNote}${abcDuration}`);
    });

    // Group notes into measures (8 eighth notes per measure for 4/4 time)
    const notesPerMeasure = 8;
    const measures = [];

    for (let i = 0; i < processedNotes.length; i += notesPerMeasure) {
      measures.push(processedNotes.slice(i, i + notesPerMeasure).join(""));
    }

    // Format the body with proper bar lines and repeats
    const formattedBody = measures
      .map((measure, index) => {
        if (index === 0) return `|:${measure}`;
        if (index === measures.length - 1) return `${measure}:|`;
        return `${measure}|`;
      })
      .join("");

    // Combine everything with just a single newline between header and body
    const result = `${header}\n${formattedBody}`;

    // Final safety check: trim any leading whitespace on each line
    return result
      .split("\n")
      .map((line) => line.trimStart())
      .join("\n");
  };

  // Proceed to the next page
  const handleProceed = () => {
    // Convert notes to ABC notation
    const abcNotation = convertToAbcNotation(notes);

    // Navigate to the next page with ABC notation as state
    navigate("/customer-compose/customer-new-compose/customer-edit", {
      state: { abcNotation },
    });
  };

  // Play the current notes
  const playComposition = async () => {
    if (isPlaying || notes.length === 0) return;

    setIsPlaying(true);

    try {
      // Make sure Tone.js is ready
      await Tone.start();

      // Set the tempo - 60 BPM means 1 second per quarter note
      Tone.Transport.bpm.value = 60;

      // Calculate note durations and create a sequence
      const sequence = [];
      let currentTime = 0;

      for (const note of notes) {
        // Get the note name from the keys array (e.g., "c/4" -> "C4")
        const vfNote = note.keys[0];

        // Find the corresponding Tone.js note name from our mapping
        let toneNoteName = null;
        for (const posKey in noteMap) {
          if (noteMap[posKey].note === vfNote) {
            toneNoteName = noteMap[posKey].tone;
            break;
          }
        }

        if (!toneNoteName) continue;

        // Calculate duration in seconds
        let durationInBeats = 0;
        if (note.duration === "w") durationInBeats = 4;
        else if (note.duration === "h") durationInBeats = 2;
        else if (note.duration === "q") durationInBeats = 1;
        else if (note.duration === "8") durationInBeats = 0.5;

        const durationInSeconds = durationInBeats;

        // Schedule the note
        sequence.push({
          note: toneNoteName,
          time: currentTime,
          duration: durationInSeconds,
        });

        // Update time for the next note
        currentTime += durationInSeconds;
      }

      // Play the sequence
      sequence.forEach((event) => {
        synth.current.triggerAttackRelease(
          event.note,
          event.duration,
          Tone.now() + event.time
        );
      });

      // Set a timeout to update the playing state when done
      setTimeout(
        () => {
          setIsPlaying(false);
        },
        currentTime * 1000 + 500
      ); // Add a small buffer
    } catch (error) {
      console.error("Error playing composition:", error);
      setIsPlaying(false);
    }
  };

  // Stop playback
  const stopPlayback = () => {
    // Cancel any scheduled events
    Tone.Transport.cancel();
    synth.current.releaseAll();
    setIsPlaying(false);
  };

  // Drawer toggle handler
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  //GlobalStyle
  const GlobalStyle = createGlobalStyle`
    body {
      margin: 0;
      padding: 0;
      font-family: 'Montserrat', sans-serif;
    }
  `;

  //LocalStyle
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
      ml: isLargeScreen ? 1 : 0,
      mt: isLargeScreen ? 2 : 8,
      width: "100%",
      overflowY: "auto",
    },
    canvas: {
      width: "600px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      marginTop: "20px",
      cursor: "pointer",
      padding: "10px",
      backgroundColor: "#FCFCFC",
    },
    controlPanel: {
      marginTop: "20px",
      padding: "15px",
      backgroundColor: "#F8F8F8",
      borderRadius: "4px",
    },
    playButton: {
      ...buttonStyles,
      backgroundColor: isPlaying ? "#6C757D" : "#8BD3E6",
      "&:hover": {
        backgroundColor: isPlaying ? "#5A6268" : "#6FBCCF",
      },
    },
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
              Compose Music Score
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
          <CustomerSidebar active="compose" />
        </Drawer>

        {/* Temporary drawer for smaller screens */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={styles.mobileDrawer}
        >
          <CustomerSidebar active="compose" />
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={styles.mainContent}>
          {/* Header Section - Desktop */}
          {isLargeScreen && (
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
                    ml: 1,
                  }}
                >
                  Compose Music Score
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                {user ? (
                  <>
                    <Typography variant="body1" sx={{ mr: 2 }}>
                      {user.username}
                    </Typography>
                    <Avatar
                      alt={user.username}
                      src={user.profile_picture || null}
                    >
                      {!user.profile_picture &&
                        user.username?.charAt(0).toUpperCase()}
                    </Avatar>
                  </>
                ) : (
                  <>
                    <Typography variant="body1" sx={{ mr: 2 }}>
                      Loading...
                    </Typography>
                    <Avatar />
                  </>
                )}
              </Box>
            </Box>
          )}

          {/* Instructions */}
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Typography variant="body1">
              Click on the staff to add notes. Use the controls below to select
              note duration. The staff follows standard music notation with
              treble clef. Click the play button to hear your composition.
            </Typography>
          </Paper>

          {/* Control Panel */}
          <Paper elevation={2} sx={styles.controlPanel}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Note Duration
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Button
                    variant={currentDuration === "w" ? "contained" : "outlined"}
                    onClick={() => setCurrentDuration("w")}
                    sx={{
                      ...buttonStyles2,
                      ...(currentDuration === "w" ? buttonStyles : {}),
                    }}
                  >
                    Whole
                  </Button>
                  <Button
                    variant={currentDuration === "h" ? "contained" : "outlined"}
                    onClick={() => setCurrentDuration("h")}
                    sx={{
                      ...buttonStyles2,
                      ...(currentDuration === "h" ? buttonStyles : {}),
                    }}
                  >
                    Half
                  </Button>
                  <Button
                    variant={currentDuration === "q" ? "contained" : "outlined"}
                    onClick={() => setCurrentDuration("q")}
                    sx={{
                      ...buttonStyles2,
                      ...(currentDuration === "q" ? buttonStyles : {}),
                    }}
                  >
                    Quarter
                  </Button>
                  <Button
                    variant={currentDuration === "8" ? "contained" : "outlined"}
                    onClick={() => setCurrentDuration("8")}
                    sx={{
                      ...buttonStyles2,
                      ...(currentDuration === "8" ? buttonStyles : {}),
                    }}
                  >
                    Eighth
                  </Button>
                </Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Instrument
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {instrumentOptions.map((instrument) => (
                    <Button
                      key={instrument.value}
                      variant={
                        selectedInstrument === instrument.value
                          ? "contained"
                          : "outlined"
                      }
                      onClick={() => handleInstrumentChange(instrument.value)}
                      sx={{
                        ...buttonStyles2,
                        ...(selectedInstrument === instrument.value
                          ? buttonStyles
                          : {}),
                      }}
                    >
                      {instrument.label}
                    </Button>
                  ))}
                </Box>            
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    justifyContent: { xs: "flex-start", sm: "flex-end" },
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<Delete />}
                    onClick={handleClear}
                    sx={{ ...buttonStyles2 }}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={isPlaying ? <Stop /> : <PlayArrow />}
                    onClick={isPlaying ? stopPlayback : playComposition}
                    disabled={notes.length === 0}
                    sx={{ ...styles.playButton }}
                  >
                    {isPlaying ? "Stop" : "Play"}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Save />} // You can change this icon if you want
                    onClick={handleProceed} // Update the function name
                    disabled={notes.length === 0}
                    sx={{ ...buttonStyles }}
                  >
                    Proceed {/* Change the text from "Save" to "Proceed" */}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* VexFlow Canvas for Composition */}
          <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
            <Paper sx={styles.canvas}>
              <div
                ref={canvasRef}
                onClick={handleCanvasClick}
                style={{ width: "100%", height: "100%" }}
              />
            </Paper>
          </Box>

          {/* Note count indicator */}
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2">
              {notes.length} note{notes.length !== 1 ? "s" : ""} in composition
              (
              {notes.length > 0
                ? notes.reduce((acc, note) => {
                    if (note.duration === "q") return acc + 1;
                    if (note.duration === "h") return acc + 2;
                    if (note.duration === "w") return acc + 4;
                    if (note.duration === "8") return acc + 0.5;
                    return acc;
                  }, 0)
                : 0}
              /4 beats)
            </Typography>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
