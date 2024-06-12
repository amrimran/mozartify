import React from "react";
import { Link } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Paper,
  Box,
  IconButton,
} from "@mui/material";
import Icon from "./assets/mozartify.png";
import LP1image from "./assets/LP1image.png";
import Why1 from "./assets/why1.png";
import Why2 from "./assets/why2.png";
import Why3 from "./assets/why3.png";
import Why4 from "./assets/why4.png";
import Why5 from "./assets/why5.png";
import Why6 from "./assets/why6.png";


const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
  }
`;

export default function Landing() {
  return (
    <>
      <GlobalStyle />
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          height: "8vh",
          background: "linear-gradient(to right, #c44131, #483C32)",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center">
            <IconButton>
              <img src={Icon} alt="Mozartify logo" style={{ height: 40 }} />{" "}
            </IconButton>
            <Typography variant="h6">Mozartify</Typography>
          </Box>
          <Box>
            <Button component={Link} to="/signup" color="inherit">
              Register
            </Button>
            <Button component={Link} to="/login" color="inherit">
              Login
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          background: "linear-gradient(to right, #c44131, #483C32)",
          height: "93vh",
          width: "100vw",
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          margin: 0,
          overflow: "hidden", // Ensure content does not overflow the box
        }}
      >
        <Grid container spacing={2} sx={{ height: "100%", margin: 0 }}>
          <Grid
            item
            xs={12}
            sm={6}
            sx={{ display: "flex", alignItems: "center", padding: 0 }}
            style={{ padding: 0 }}
          >
            <Box
              sx={{
                textAlign: "left",
                width: "100%",
                paddingLeft: 10,
                paddingRight: 10,
              }}
            >
              <Typography
                color="#ffffff"
                component="h1"
                variant="h2"
                gutterBottom
                fontFamily="Montserrat"
                fontWeight="bold"
              >
                Access digital <br />
                music scores by <br />
                Universiti Malaya <br />
                composers, <br />
                anywhere, anytime, <br />
                all in one place.
              </Typography>
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            sx={{ display: "flex", alignItems: "center", padding: 0 }}
            style={{ padding: 0 }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "100%",
              }}
            >
              <img
                src={LP1image}
                alt="Music scores"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box
        sx={{
          background: "#ffffff",
          height: "100vh",
          width: "100vw",
          display: "flex",
          flexDirection: "column",
          margin: 0,
          overflow: "hidden",
          pt: 8,
          pb: 8,
          alignItems: "center",
        }}
      >
        <Typography
          color="#c44131"
          component="h1"
          variant="h2"
          gutterBottom
          fontFamily="Montserrat"
          fontWeight="bold"
          align="center"
        >
          Why Mozartify?
        </Typography>

        <Box sx={{ margin: 4, px: 20 }}>
          <Grid container spacing={10}>
            {[
              {
                text: "Instant access to music scores",
                imageUrl: Why1,
              },
              {
                text: "Browse diverse UM composers' collections",
                imageUrl: Why2,
              },
              {
                text: "Interactively view digital music scores",
                imageUrl: Why3,
              },
              {
                text: "Purchase digital music scores seamlessly",
                imageUrl: Why4,
              },
              {
                text: "Explore with tailored music recommendations",
                imageUrl: Why5,
              },
              {
                text: "Export music scores to various formats with ease",
                imageUrl: Why6,
              },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 2,
                    boxShadow: "none", // Remove shadow
                    border: "none", // Ensure no border
                  }}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.text}
                    style={{
                      width: "35%",
                      height: "auto",
                      marginBottom: 16, // Space between image and text
                    }}
                  />
                  <Typography
                    color="#483C32"
                    component="h1"
                    variant="h5"
                    gutterBottom
                    fontFamily="Montserrat"
                    align="center"
                  >
                    {item.text}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      <Box
        sx={{
          background: "#c44131",
          height: "100vh",
          width: "100vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          margin: 0,
          overflow: "hidden",
          borderBottom: "2px solid white",
          pt: 8,
        }}
      >
        <Typography
          color="#ffffff"
          component="h1"
          variant="h3"
          gutterBottom
          fontFamily="Montserrat"
          fontWeight="bold"
          align="center"
        >
          Browse Music Scores <br /> based on
        </Typography>
        <Box
          sx={{
            flexGrow: 0.5,
            width: "100%",
            display: "flex",
            pt: 3,
            margin: 10,
          }}
        >
          <Grid
            container
            spacing={8}
            justifyContent="center"
            sx={{ py: 3, px: 10 }}
          >
            {["Artist", "Title", "Composer", "Instrumentation", "Genre"].map(
              (text, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Button
                    variant="contained"
                    sx={{
                      width: "100%",
                      minHeight: "160px", // Set the minimum height to double the original
                      backgroundColor: "white",
                      color: "black",
                      border: "2px solid black",
                      borderRadius: 15,
                      textTransform: "none",
                      fontFamily: "Montserrat",
                      fontSize: "2.5rem",
                      padding: "20px 20px",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      "&:hover": {
                        backgroundColor: "white",
                      },
                    }}
                  >
                    {text}
                  </Button>
                </Grid>
              )
            )}
          </Grid>
        </Box>
      </Box>

      <Box
        component="footer"
        sx={{
          py: 3,
          background: "#E4DCC8",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="body2"
            align="center"
            color="inherit"
            component="p"
          >
            &copy; 2024 Universiti Malaya. All Rights Reserved.
          </Typography>
        </Container>
      </Box>
    </>
  );
}
