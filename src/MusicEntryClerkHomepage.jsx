import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
} from "@mui/material";

export default function MusicEntryClerkHomepage() {
  const [musicScores, setMusicScores] = useState([]);

  useEffect(() => {
    const fetchMusicScores = async () => {
      try {
        const response = await axios.get("http://localhost:3001/abc-files");
        setMusicScores(response.data);
      } catch (error) {
        console.error("Error fetching music scores:", error);
      }
    };

    fetchMusicScores();
  }, []);

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Music Scores
      </Typography>
      <Grid container spacing={2}>
        {musicScores.length > 0 ? (
          musicScores.map((score) => (
            <Grid item xs={12} sm={6} md={4} key={score._id}>
              <Card sx={{ display: "flex", flexDirection: "column" }}>
                <CardMedia
                  component="img"
                  image={score.coverImageUrl || "default_image_url.jpg"}
                  alt={score.title}
                  sx={{ height: 200 }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {score.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Composer: {score.composer}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography variant="body2">No scores found</Typography>
        )}
      </Grid>
    </Box>
  );
}
