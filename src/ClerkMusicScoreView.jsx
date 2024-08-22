import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Typography, Button, Card, CardContent, List, ListItem, ListItemText, Avatar, Divider } from "@mui/material";
import ClerkSidebar from "./ClerkSidebar";
import abcjs from "abcjs";

export default function ClerkMusicScoreView() {
  const { scoreId } = useParams();
  const [abcContent, setAbcContent] = useState("");
  const [metadata, setMetadata] = useState(null);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  const buttonStyles = {
    fontFamily: "Montserrat",
    fontWeight: "bold",
    color: "#3B3183",
    borderColor: "#3B3183",
    width: "250px",
    height: "40px",
    "&:hover": {
      backgroundColor: "#3B3183",
      color: "#FFFFFF",
      borderColor: "#3B3183",
    },
  };

  const deleteButtonStyles = {
    fontFamily: "Montserrat",
    fontWeight: "bold",
    color: "#DB2226",
    borderColor: "#DB2226",
    width: "250px",
    height: "40px",
    "&:hover": {
      backgroundColor: "#DB2226",
      color: "#FFFFFF",
      borderColor: "#DB2226",
    },
  };

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
        const response = await axios.get(`http://localhost:3001/abc-file/${scoreId}`);
        setAbcContent(response.data.content);
        setMetadata(response.data);
        renderAbc(response.data.content);
      } catch (error) {
        console.error("Error fetching the ABC file and metadata:", error);
      }
    };

    fetchUserSession();
    fetchAbcFileAndMetadata();
  }, [scoreId]);

  const renderAbc = (abcNotation) => {
    if (abcjs) {
      abcjs.renderAbc("abc-container", abcNotation);
    }
  };

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
    // Handle delete action
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
        <ClerkSidebar />
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
          <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Montserrat', fontWeight: 'bold', mt: 2, ml:1 }}>
            Manage Music Scores
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body1" sx={{ mr: 2, fontFamily: "Montserrat" }}>
              {user ? user.username : "Guest"}
            </Typography>
            <Avatar>{user ? user.username.charAt(0) : "G"}</Avatar>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", gap: 4 }}>
          {/* Music Score Preview */}
          <Card sx={{ flexGrow: 1, p: 3, bgcolor: "#F2F2F5", borderRadius: 2 }}>
            <Box sx={{ bgcolor: "#FFFFFF", borderRadius: 2, p: 2 }}>
              {abcContent ? (
                <div id="abc-container" style={{ width: "100%", borderRadius: "10px", backgroundColor: "#FFFFFF" }}>
                  {/* ABC notation will be rendered here */}
                </div>
              ) : (
                <Typography variant="body2" sx={{ fontFamily: "Montserrat" }}>
                  Loading music score...
                </Typography>
              )}
            </Box>
          </Card>

          {/* Music Score Details */}
          {metadata ? (
            <Card sx={{ width: 200, p: 2, bgcolor: "#F2F2F5", borderRadius: 2, height: "auto", maxHeight: "500px", overflowY: "auto", flexGrow: 1 }}>
              <CardContent sx={{ bgcolor: "#FFFFFF", borderRadius: 2, p: 0, pl: -1 }}>
                <List>
                  {/* Reordered Fields */}
                  <ListItem>
                    <ListItemText
                      primary="Title"
                      secondary={metadata.title || 'N/A'}
                      primaryTypographyProps={{ sx: { fontFamily: "Montserrat", fontWeight: "bold" } }}
                      secondaryTypographyProps={{ sx: { fontFamily: "Montserrat" } }}
                      sx={{ p: 1 }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Artist"
                      secondary={metadata.artist || 'N/A'}
                      primaryTypographyProps={{ sx: { fontFamily: "Montserrat", fontWeight: "bold" } }}
                      secondaryTypographyProps={{ sx: { fontFamily: "Montserrat" } }}
                      sx={{ p: 1 }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Composer"
                      secondary={metadata.composer || 'N/A'}
                      primaryTypographyProps={{ sx: { fontFamily: "Montserrat", fontWeight: "bold" } }}
                      secondaryTypographyProps={{ sx: { fontFamily: "Montserrat" } }}
                      sx={{ p: 1 }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Genre"
                      secondary={metadata.genre || 'N/A'}
                      primaryTypographyProps={{ sx: { fontFamily: "Montserrat", fontWeight: "bold" } }}
                      secondaryTypographyProps={{ sx: { fontFamily: "Montserrat" } }}
                      sx={{ p: 1 }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Instrumentation"
                      secondary={metadata.instrumentation || 'N/A'}
                      primaryTypographyProps={{ sx: { fontFamily: "Montserrat", fontWeight: "bold" } }}
                      secondaryTypographyProps={{ sx: { fontFamily: "Montserrat" } }}
                      sx={{ p: 1 }}
                    />
                  </ListItem>

                  {/* Remaining Fields */}
                  {Object.keys(metadata).map((key) => (
                    !['title', 'artist', 'composer', 'genre', 'instrumentation', 'content', '__v', '_id', 'filename', 'coverImageUrl'].includes(key) && (
                      <ListItem key={key}>
                        <ListItemText
                          primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          secondary={metadata[key] || 'N/A'}
                          primaryTypographyProps={{ sx: { fontFamily: "Montserrat", fontWeight: "bold" } }}
                          secondaryTypographyProps={{ sx: { fontFamily: "Montserrat" } }}
                          sx={{ p: 1 }}
                        />
                      </ListItem>
                    )
                  ))}
                </List>
              </CardContent>
            </Card>
          ) : (
            <Typography variant="body2" sx={{ fontFamily: "Montserrat" }}>
              Loading metadata...
            </Typography>
          )}
        </Box>

        <Box sx={{ mt: 4, display: "flex", justifyContent: "center", gap: 2 }}>
          <Button variant="outlined" onClick={handleBackClick} sx={buttonStyles}>
            Back
          </Button>
          <Button variant="outlined" onClick={handleEditMusicScoreClick} sx={buttonStyles}>
            Edit
          </Button>
          <Button variant="outlined" onClick={handleDeleteClick} sx={deleteButtonStyles}>
            Delete
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
