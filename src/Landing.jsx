import React, { useState } from "react";
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
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
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
  html, body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
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
    height: 4px;
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

  .carousel {
    width: 100vw;
    position: relative;
  }

  .carousel .slide {
    background: #ffffff;
  }

  .carousel .slide img {
    width: 100vw;
    max-height: 93vh;
    height: auto;
    object-fit: cover;
  }

  @media (min-width: 601px) {
    .carousel .slide img {
      height: calc(100vh - 10vh);
      object-fit: cover;
    }
  }

  @media (max-width: 600px) {
    .carousel {
      width: 100%;
      position: static;
      margin-left: 0;
      margin-right: 0;
    }
    .carousel .slide img {
      width: 100%;
      height: auto;
      max-height: calc(100vh - 8vh);
      object-fit: contain;
    }
  }
`;

export default function Landing() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      const headerOffset = isMobile ? 64 : 80;
      const elementPosition =
        section.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    if (isMobile) {
      handleDrawerToggle();
    }
  };

  const drawer = (
    <List>
      {["Features", "Search", "Get Started"].map((text, index) => (
        <ListItem
          button
          key={text}
          onClick={() => {
            if (text === "Get Started") {
              handleDrawerToggle();
            } else {
              scrollToSection(text.toLowerCase());
            }
          }}
          component={text === "Get Started" ? Link : "div"}
          to={text === "Get Started" ? "/signup" : undefined}
        >
          <ListItemText
            primary={text}
            sx={{
              "& .MuiTypography-root": {
                fontFamily: "Montserrat",
                fontWeight: 500,
              },
            }}
          />
        </ListItem>
      ))}
    </List>
  );

  return (
    <>
      <GlobalStyle />
      <AppBar
        position="sticky"
        elevation={2}
        sx={{
          height: { xs: "8vh", sm: "10vh" },
          background: "#ffffff",
          fontFamily: "Montserrat",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center">
            <IconButton
              sx={{
                "&:hover": {
                  backgroundColor: "transparent", // Prevents hover background effect
                  boxShadow: "none", // Disables hover shadow
                  transition: "none", // Disables any hover animation
                },
              }}
            >
              <img
                src={UMLogo}
                alt="UM logo"
                style={{
                  height: isMobile ? 40 : 50,
                }}
              />
            </IconButton>
          </Box>
          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ color: "#000000" }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
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
              <Button component={Link} to="/signup" className="header-button">
                Get Started
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 240,
            background: "#ffffff",
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        sx={{
          width: "100%",
          overflow: "hidden",
          position: "relative",
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
          {[slide1, slide2, slide3, slide4].map((slide, index) => (
            <div key={index}>
              <img src={slide} alt={`Slide ${index + 1}`} />
            </div>
          ))}
        </Carousel>
      </Box>

      <Box
        id="features"
        sx={{
          background: "#ffffff",
          width: "100%",
          py: { xs: 4, sm: 6 },
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
          sx={{
            fontSize: { xs: "2rem", sm: "3rem" },
            mb: 4,
          }}
        >
          Features
        </Typography>
        <Box
          sx={{
            width: "100vw",
            position: "relative",
            left: "50%",
            right: "50%",
            marginLeft: "-50vw",
            marginRight: "-50vw",
            overflow: "hidden",
          }}
        >
          <img
            src={features}
            alt="Features"
            style={{
              width: "100vw",
              height: "auto",
              display: "block",
            }}
          />
        </Box>
      </Box>

      <Box
        id="search"
        sx={{
          background: "#ffffff",
          width: "100%",
          py: { xs: 4, sm: 6 },
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
          sx={{
            fontSize: { xs: "2rem", sm: "3rem" },
            mb: 2,
          }}
        >
          Search Music Scores
        </Typography>
        <Typography
          color="#3B3183"
          component="h2"
          variant="h6"
          fontFamily="Montserrat"
          align="center"
          sx={{
            fontSize: { xs: "1rem", sm: "1.25rem" },
            mb: 4,
          }}
        >
          based on these categories
        </Typography>
        <Box
          sx={{
            width: "100vw",
            position: "relative",
            left: "50%",
            right: "50%",
            marginLeft: "-50vw",
            marginRight: "-50vw",
            overflow: "hidden",
          }}
        >
          <img
            src={searchmusic}
            alt="Search Music"
            style={{
              width: "100vw",
              height: "auto",
              display: "block",
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          background: "#3B3183",
          width: "100%",
          py: { xs: 6, sm: 8 },
          px: 2,
          overflow: "hidden",
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
          sx={{
            fontSize: { xs: "1.75rem", sm: "3rem" },
            mb: 2,
          }}
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
          sx={{
            fontSize: { xs: "1.75rem", sm: "3rem" },
            mb: 4,
          }}
        >
          EXPERIENCE TODAY
        </Typography>
        <Container maxWidth="sm" sx={{ textAlign: "center" }}>
          <Button
            component={Link}
            to="/signup"
            variant="outlined"
            size="large"
            sx={{
              px: { xs: 3, sm: 4 },
              py: { xs: 1, sm: 1 },
              fontFamily: "Montserrat",
              fontWeight: "bold",
              color: "#FFFFFF",
              backgroundColor: "#8BD3E6",
              border: "1px solid #8BD3E6",
              "&:hover": {
                backgroundColor: "#6FBCCF",
                borderColor: "#6FBCCF",
              },
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            Get Started
          </Button>
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          py: { xs: 1.5, sm: 2 },
          background: "#F5D128",
          width: "100%",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="body2"
            align="center"
            className="footer-text"
            component="p"
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              fontFamily: "Montserrat",
            }}
          >
            &copy; 2025 Universiti Malaya. All Rights Reserved.
          </Typography>
        </Container>
      </Box>
    </>
  );
}
