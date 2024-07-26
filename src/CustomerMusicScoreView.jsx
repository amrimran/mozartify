import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText
} from '@mui/material';

export default function CustomerMusicScoreView(){
  const { id } = useParams();
  const [musicScore, setMusicScore] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/customer-music-score-view/${id}`)
      .then((response) => {
        setMusicScore(response.data);
      })
      .catch((error) => {
        console.error("Error fetching music score details:", error);
      });
  }, [id]);

  if (!musicScore) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {musicScore.ms_title}
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="Genre" secondary={musicScore.ms_genre} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Composer" secondary={musicScore.ms_composer} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Artist" secondary={musicScore.ms_artist} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Instrumentation" secondary={musicScore.ms_instrumentation} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Price" secondary={`$${musicScore.ms_price}`} />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};
