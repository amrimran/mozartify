import React, { useEffect, useState } from "react";
import abcjs from "abcjs";
import "C:/Users/ADMIN/OneDrive/Documents/GitHub/mozartify/src/abcjs-audio.css";

const Play = () => {
  const abcNotation = `
    X: 1
    T: Cooley's
    M: 4/4
    L: 1/8
    R: reel
    K: Emin
    |:D2|EB{c}Bb B2 EB|~B2 AB dBAG|FDAD BDAD|FDAD dAFD|
    EBBA B2 EB|B2 Ab defg|afe^c dBAF|DEFD E2:|
    |:gf|eB B2 efge|eB B2 gedB|A2 FA DAFA|A2 FA defg|
    eB B2 eBgB|eB B2 defg|afe^c dBAF|DEFD E2:|
  `;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  let synthControl = null;
  let visualObj = null;

  useEffect(() => {
    // Render the ABC notation
    visualObj = abcjs.renderAbc("notation-container", abcNotation, {
      responsive: "resize",
    });

    // Initialize SynthController for playback controls
    synthControl = new abcjs.synth.SynthController();
    synthControl.load("#controls", {
      displayPlay: false, // Hide the default play button
      displayProgress: false,
    });

    // Load the tune into the SynthController
    synthControl.setTune(visualObj[0], false);

    // Cleanup on unmount
    return () => {
      if (synthControl) synthControl.pause();
    };
  }, [abcNotation]);

  const startPlayback = async () => {
    try {
      if (!abcjs.synth.audioContext) {
        abcjs.synth.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } else if (abcjs.synth.audioContext.state === "suspended") {
        await abcjs.synth.audioContext.resume();
      }

      setIsPlaying(true);
      synthControl.play({
        onEvent: (event) => {
          if (event && event.midiPitches) {
            // Clear previous highlights
            visualObj[0].unhighlight();

            // Highlight the current note
            visualObj[0].highlight(event.startChar, event.endChar, { color: "#ff0000" });

            // Update the current position for the playback indicator
            setCurrentPosition(event.startChar);
          }
        },
      });
    } catch (error) {
      console.error("Error during playback:", error);
    }
  };

  const pausePlayback = () => {
    synthControl.pause();
    setIsPlaying(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>ABC to MIDI Player</h1>
      <p style={styles.description}>
        Convert and play ABC notation as MIDI with synchronized note highlighting. Use the play and pause buttons to control playback.
      </p>
      
      <div id="notation-container" style={styles.notationContainer}>
        {/* Line indicating current playback position */}
        {currentPosition !== null && (
          <div
            style={{
              ...styles.playbackLine,
              left: `${currentPosition * 2}px`, // Adjust multiplier as needed to sync with notation
            }}
          />
        )}
      </div>
      
      <div id="controls" style={styles.controls}>
        {/* Play and Pause buttons */}
        {!isPlaying ? (
          <button onClick={startPlayback} style={styles.button}>Play</button>
        ) : (
          <button onClick={pausePlayback} style={styles.button}>Pause</button>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    fontFamily: "'Arial', sans-serif",
  },
  header: {
    color: "#333",
    fontSize: "2em",
    marginBottom: "10px",
  },
  description: {
    color: "#555",
    fontSize: "1.1em",
    marginBottom: "20px",
  },
  notationContainer: {
    position: "relative",
    margin: "20px 0",
    padding: "10px",
    backgroundColor: "#fff",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
  controls: {
    marginTop: "15px",
    padding: "10px",
    display: "inline-block",
    backgroundColor: "#efefef",
    borderRadius: "5px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "1em",
    cursor: "pointer",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#4CAF50",
    color: "#fff",
    margin: "0 5px",
  },
  playbackLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "2px",
    backgroundColor: "red",
    pointerEvents: "none",
  },
};

export default Play;
