import React from "react";
import { Link } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
} from "@mui/material";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import UMLogo from "./assets/UMLogo.png";
import slide1 from "./assets/slide1.png";
import slide2 from "./assets/slide2.png";
import slide3 from "./assets/slide3.png";
import slide4 from "./assets/slide4.png";
import features from "./assets/features.png";
import searchmusic from "./assets/searchmusic.png";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
    overflow-x: hidden; /* Prevent horizontal scrolling */
  }

  .header-button {
    font-family: 'Montserrat', sans-serif;
    text-transform: none;
    color: #000000;
    font-weight: 500;
    position: relative;
    transition: color 0.3s ease;
    border: none;
    background: none;
    box-shadow: none;
  }

  .header-button::after {
    content: '';
    position: absolute;
    width: 0%;
    height: 4px; /* Thicker line */
    background: #F5D128;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    transition: width 0.3s ease;
  }

  .header-button:hover {
    color: #F5D128;
  }

  .header-button:hover::after {
    width: 100%;
  }

  .footer-text {
    font-family: 'Montserrat', sans-serif;
    color: #000000;
  }

  .custom-carousel .control-arrow {
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .custom-carousel:hover .control-arrow {
    opacity: 1;
  }

  .custom-carousel .control-next.control-arrow:before,
  .custom-carousel .control-prev.control-arrow:before {
    content: '';
    border: solid white;
    border-width: 0 3px 3px 0;
    display: inline-block;
    padding: 10px;
  }

  .custom-carousel .control-next.control-arrow:before {
    transform: rotate(-45deg);
  }

  .custom-carousel .control-prev.control-arrow:before {
    transform: rotate(135deg);
  }
`;

export default function Landing() {
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      const headerOffset = 69; // Adjust this value to match your header height
      const elementPosition = section.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <>
      <GlobalStyle />
      <AppBar
        position="sticky"
        elevation={2}
        sx={{
          height: "10vh", /* Slightly bigger header */
          background: "#ffffff",
          fontFamily: "Montserrat",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)", /* Thicker shadow */
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center">
            <IconButton>
              <img src={UMLogo} alt="UM logo" style={{ height: 50 }} /> {/* Adjust logo size if needed */}
            </IconButton>
          </Box>
          <Box>
            <Button
              onClick={() => scrollToSection("features")}
              className="header-button"
            >
              Features
            </Button>
            <Button
              onClick={() => scrollToSection("search")}
              className="header-button"
            >
              Search
            </Button>
            <Button
              component={Link}
              to="/signup"
              className="header-button"
            >
              Get Started
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          height: "93vh",
          width: "100vw",
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          margin: 0,
          overflow: "hidden",
        }}
      >
        <Carousel
          showThumbs={false}
          showStatus={false}
          infiniteLoop
          autoPlay
          interval={5000}
          className="custom-carousel"
        >
          <div>
            <img src={slide1} alt="Slide 1" />
          </div>
          <div>
            <img src={slide2} alt="Slide 2" />
          </div>
          <div>
            <img src={slide3} alt="Slide 3" />
          </div>
          <div>
            <img src={slide4} alt="Slide 4" />
          </div>
        </Carousel>
      </Box>

      <Box
        id="features"
        sx={{
          background: "#ffffff",
          height: "auto",
          width: "100%", /* Ensure it doesn't exceed viewport width */
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          margin: 0,
          overflow: "hidden",
        }}
      >
        <Typography
          color="#3B3183"
          component="h1"
          variant="h3"
          gutterBottom
          fontFamily="Montserrat"
          fontWeight="bold"
          align="center"
          sx={{ marginTop: 4 }}
        >
          Features
        </Typography>
        <img src={features} alt="Features" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </Box>

      <Box
        id="search"
        sx={{
          background: "#ffffff",
          height: "auto",
          width: "100%", /* Ensure it doesn't exceed viewport width */
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          margin: 0,
          overflow: "hidden",
        }}
      >
        <Typography
          color="#3B3183"
          component="h1"
          variant="h3"
          gutterBottom
          fontFamily="Montserrat"
          fontWeight="bold"
          align="center"
          sx={{ marginTop: 4 }}
        >
          Search Music Scores
        </Typography>
        <Typography
          color="#3B3183"
          component="h2"
          variant="h6"
          fontFamily="Montserrat"
          align="center"
          sx={{ marginBottom: 2 }}
        >
          based on these categories
        </Typography>
        <img src={searchmusic} alt="Search Music" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </Box>

      <Box
        sx={{
          background: "#3B3183",
          height: "auto",
          width: "100%", /* Ensure it doesn't exceed viewport width */
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          margin: 0,
          overflow: "hidden",
          py: 8,
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
          DIGITIZE YOUR MUSIC
        </Typography>
        <Typography
          color="#ffffff"
          component="h1"
          variant="h3"
          gutterBottom
          fontFamily="Montserrat"
          fontWeight="bold"
          align="center"
        >
          EXPERIENCE TODAY
        </Typography>
        <Button
          component={Link}
          to="/signup"
          variant="outlined"
          size="large"
          sx={{
            fontFamily: "Montserrat",
            fontWeight: "normal",
            backgroundColor: "transparent",
            color: "#ffffff",
            borderColor: "#ffffff",
            "&:hover": {
              fontWeight: "bold",
              backgroundColor: "#DB2226",
              color: "#FFFFFF",
              borderColor: "#DB2226",
              boxShadow: "none", /* Remove any box shadow on hover */
            },
            boxShadow: "none", /* Ensure no box shadow is present */
          }}
        >
          Get Started
        </Button>
      </Box>

      <Box
        component="footer"
        sx={{
          py: 1,
          background: "#F5D128",
          width: "100%", /* Ensure it doesn't exceed viewport width */
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="body2"
            align="center"
            className="footer-text"
            component="p"
          >
            &copy; 2024 Universiti Malaya. All Rights Reserved.
          </Typography>
        </Container>
      </Box>
    </>
  );
}
