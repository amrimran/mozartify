import React, { useEffect, useState, useRef } from "react";
import abcjs from "abcjs";
import "C:/Users/ADMIN/OneDrive/Documents/GitHub/mozartify/src/abcjs-audio.css";

const Play = () => {
  const abcNotation = `
    X:1
    T:Piano Sonata KV 331, Theme of Mvmt. 1
    C:Wolfgang Amadeus Mozart
    Z:free-scores.com
    %%score { ( 1 2 ) | ( 3 4 ) }
    L:1/4
    M:6/4
    I:linebreak $
    K:G
    V:1 treble nm="Piano" snm="Piano"
    V:2 treble 
    V:3 bass 
    V:4 bass 
    V:1
    !<(! (B3/2 c/!<)! B!>(! d2)!>)! (d |!<(! A3/2!<)! B/ A!>(! c2)!>)! (c |!<(! G2 G A2!<)! A | %3
    B2 d/c/!>(! B2!>)! A) |$!<(! (B3/2 c/!<)! B!>(! d2)!>)! (d |!<(! A3/2!<)! B/ A!>(! c2)!>)! c | %6
    !<(! G2 A B2!<)! [Ac] |!p! [GB]2 [DFA] G2 z ::$!p! (d3/2 e/ d e2) (e | (e/4 g3/2) f/ e) (e d) .d | %10
    (d B) .G (d c) .A |$ (d B) .G ([GB]2 [FA]) | (B3/2 c/ B d2) (d x/ |$ A3/2 B/ A c2) c | %14
    !<(! G2 A B2!<)! [Ac] |!p! [GB]2 [FA] ([FA]2 [GB]) |!f! [GB]2 [Gc] [Gd]2 (e/f/4g/4) |$ %17
    G2 (B/A/) G2 z :| %18
  `;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const visualRef = useRef(null); // Reference for ABC rendering
  const synthControlRef = useRef(null); // Reference for SynthController

  // Initializing visual object and synth controller
  useEffect(() => {
    if (visualRef.current) {
      const renderResult = abcjs.renderAbc(visualRef.current, abcNotation, {
        responsive: "resize",
      });

      // Initialize SynthController with ABC notation
      synthControlRef.current = new abcjs.synth.SynthController();
      synthControlRef.current.load("#controls", {
        displayPlay: false,
        displayProgress: false,
      });

      synthControlRef.current.setTune(renderResult[0], false);
    }

    // Cleanup on unmount
    return () => {
      if (synthControlRef.current) synthControlRef.current.pause();
    };
  }, [abcNotation]);

  // Function to start playback
  const startPlayback = async () => {
    try {
      // Create or resume audio context
      if (!abcjs.synth.audioContext) {
        abcjs.synth.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } else if (abcjs.synth.audioContext.state === "suspended") {
        await abcjs.synth.audioContext.resume();
      }

      setIsPlaying(true);

      // Start playback and highlight notes
      synthControlRef.current.play({
        onEvent: (event) => {
          if (event && event.midiPitches) {
            // Clear previous highlights
            visualRef.current[0].unhighlight();

            // Highlight current note
            visualRef.current[0].highlight(event.startChar, event.endChar, { color: "#ff0000" });

            // Update current position of playback
            setCurrentPosition(event.startChar);
          }
        },
      });
    } catch (error) {
      console.error("Error during playback:", error);
    }
  };

  // Function to pause playback
  const pausePlayback = () => {
    synthControlRef.current.pause();
    setIsPlaying(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>ABC to MIDI Player</h1>
      <p style={styles.description}>
        Convert and play ABC notation as MIDI with synchronized note highlighting. Use the play and pause buttons to control playback.
      </p>

      <div id="notation-container" ref={visualRef} style={styles.notationContainer}>
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

// Styles for the component
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
