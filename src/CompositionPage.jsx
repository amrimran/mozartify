import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import Vex from "vexflow";
import * as Tone from "tone"; // Added the proper Tone.js import

const CompositionPage = () => {
  const canvasRef = useRef(null);
  const [notes, setNotes] = useState([
    { keys: ["c/4"], duration: "q" },
    { keys: ["e/4"], duration: "q" },
    { keys: ["g/4"], duration: "q" },
    { keys: ["c/5"], duration: "q" },
  ]);
  const [clef, setClef] = useState("treble"); // treble, bass
  const [timeSignature, setTimeSignature] = useState("4/4");
  const [keySignature, setKeySignature] = useState("C");

  useEffect(() => {
    if (!canvasRef.current) return;
  
    // Clear previous content
    canvasRef.current.innerHTML = '';
  
    const VF = Vex;
    const renderer = new VF.Renderer(canvasRef.current, VF.Renderer.Backends.SVG);
    renderer.resize(500, 200);
    const context = renderer.getContext();
    context.setFont('Arial', 10);
  
    // Create a stave and configure it
    const stave = new VF.Stave(10, 40, 400);
    stave.addClef(clef).addTimeSignature(timeSignature).addKeySignature(keySignature);
    stave.setContext(context).draw();
  
    // Only create a voice and add notes if there are notes to display
    if (notes.length > 0) {
      // Calculate the total duration of the notes
      const totalDuration = notes.reduce((acc, note) => {
        let durationValue = 0;
        if (note.duration === 'q') durationValue = 1; // quarter note = 1 beat
        if (note.duration === 'h') durationValue = 2; // half note = 2 beats
        if (note.duration === 'w') durationValue = 4; // whole note = 4 beats
        if (note.duration === '8') durationValue = 0.5; // eighth note = 0.5 beats
        return acc + durationValue;
      }, 0);
  
      // Create a voice with the correct number of beats
      const voice = new VF.Voice({ num_beats: totalDuration, beat_value: 4 });
  
      // Create notes from state
      const tickables = notes.map((noteData) => {
        return new VF.StaveNote({
          clef: clef,
          keys: noteData.keys,
          duration: noteData.duration,
        });
      });
  
      voice.addTickables(tickables);
      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave);
      voice.draw(context, stave);
    }
  }, [notes, clef, timeSignature, keySignature]);
  
  const clearComposition = () => {
    setNotes([]); // Reset notes to an empty array
  };
  
  const addNote = (note, duration) => {
    setNotes((prevNotes) => [
      ...prevNotes,
      { keys: [note], duration: duration },
    ]);
  };

  // Fixed playNotes function to properly use Tone.js
  const playNotes = async () => {
    await Tone.start(); // Ensure Tone.js is ready
    const synth = new Tone.Synth().toDestination();
    const now = Tone.now();
  
    notes.forEach((note, index) => {
      const noteKey = note.keys[0].replace('/', '').toUpperCase(); // Convert VexFlow format to Tone.js format
      let durationInSeconds = 0.5; // Default quarter note duration
      if (note.duration === 'h') durationInSeconds = 1; // half note
      if (note.duration === 'w') durationInSeconds = 2; // whole note
      if (note.duration === '8') durationInSeconds = 0.25; // eighth note
  
      synth.triggerAttackRelease(noteKey, durationInSeconds, now + index * durationInSeconds);
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "30px",
      }}
    >
      <Typography variant="h4" sx={{ marginBottom: "20px" }}>
        Music Composition and Playback
      </Typography>

      {/* VexFlow Canvas for Composition */}
      <div
        ref={canvasRef}
        style={{
          border: "1px solid black",
          width: "500px",
          height: "200px",
          marginBottom: "20px",
        }}
      />

      {/* Controls for Clef, Time Signature, and Key Signature */}
      <Box sx={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <FormControl size="small">
          <InputLabel id="clef-label">Clef</InputLabel>
          <Select
            labelId="clef-label"
            value={clef}
            label="Clef"
            onChange={(e) => setClef(e.target.value)}
          >
            <MenuItem value="treble">Treble</MenuItem>
            <MenuItem value="bass">Bass</MenuItem>
            <MenuItem value="alto">Alto</MenuItem>
            <MenuItem value="tenor">Tenor</MenuItem>
            <MenuItem value="soprano">Soprano</MenuItem>
            <MenuItem value="subbass">Subbass</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel id="time-signature-label">Time Signature</InputLabel>
          <Select
            labelId="time-signature-label"
            value={timeSignature}
            label="Time Signature"
            onChange={(e) => setTimeSignature(e.target.value)}
          >
            <MenuItem value="4/4">4/4</MenuItem>
            <MenuItem value="3/4">3/4</MenuItem>
            <MenuItem value="6/8">6/8</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel id="key-signature-label">Key Signature</InputLabel>
          <Select
            labelId="key-signature-label"
            value={keySignature}
            label="Key Signature"
            onChange={(e) => setKeySignature(e.target.value)}
          >
            <MenuItem value="C">C Major</MenuItem>
            <MenuItem value="G">G Major</MenuItem>
            <MenuItem value="F">F Major</MenuItem>
            <MenuItem value="D">D Major</MenuItem>
            <MenuItem value="A">A Major</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Note selection */}
      <Box sx={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Button variant="outlined" onClick={() => addNote("c/4", "q")}>
          Add C4
        </Button>
        <Button variant="outlined" onClick={() => addNote("d/4", "q")}>
          Add D4
        </Button>
        <Button variant="outlined" onClick={() => addNote("e/4", "q")}>
          Add E4
        </Button>
        <Button variant="outlined" onClick={() => addNote("f/4", "q")}>
          Add F4
        </Button>
        <Button variant="outlined" onClick={() => addNote("g/4", "q")}>
          Add G4
        </Button>
        <Button variant="outlined" onClick={() => addNote("a/4", "q")}>
          Add A4
        </Button>
        <Button variant="outlined" onClick={() => addNote("b/4", "q")}>
          Add B4
        </Button>
      </Box>

      {/* Playback and control buttons */}
      <Box sx={{ display: "flex", gap: "10px" }}>
        <Button
          variant="contained"
          onClick={playNotes}
          sx={{ backgroundColor: "#4CAF50", color: "white" }}
        >
          Play Composition
        </Button>
        <Button
          variant="contained"
          onClick={clearComposition}
          sx={{ backgroundColor: "#f44336", color: "white" }}
        >
          Clear All
        </Button>
      </Box>
    </Box>
  );
};

export default CompositionPage;
