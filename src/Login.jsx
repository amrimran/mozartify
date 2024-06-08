import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  InputAdornment,
  IconButton,
  Modal,
} from "@mui/material";
import { styled } from "@mui/system";
import { createGlobalStyle } from "styled-components";
import Visibility from '@mui/icons-material/VisibilityOff';
import VisibilityOff from '@mui/icons-material/Visibility';
import Image from "./assets/mozartify.png";
import Image2 from "./assets/handmusic.png";
import backgroundImage from "./assets/loginWP.png";

const FormContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#FFFFFF",
  borderRadius: "20px",
  boxShadow: "0px 3px 6px rgba(0,0,0,1)",
  padding: 80,
  width: "60%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: 'Montserrat',
}));

const BackgroundContainer = styled(Box)(() => ({
  backgroundColor: "#f5f5f5",
  backgroundImage: `url(${backgroundImage})`,
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundAttachment: "fixed",
  backgroundPosition: "top",
  minHeight: "100vh",
  width: "100vw",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  flexDirection: "row",
  margin: 0,
  overflow: "hidden",
  fontFamily: 'Montserrat',
}));

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif;
  }
`;

const ModalContainer = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "#FFFFFF",
  border: "2px solid #483C32",
  boxShadow: 24,
  padding: 32,
  width: 400,
  textAlign: "center",
  fontFamily: 'Montserrat',
}));

const LeftContainer = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  padding: 20,
  fontFamily: 'Montserrat',
  position: 'relative', // Enable absolute positioning for child elements
}));

const HandMusicImage = styled('img')(({ theme }) => ({
  position: 'bottom',
  bottom: 0,
  left: 0,
  width: '150%',
  maxWidth: '450px', // Ensure the image is big
}));

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3001/login", { email, password })
      .then((result) => {
        console.log(result);
        if (result.data === "Success") {
          setIsModalOpen(true);
        } else {
          setErrorMessage("Invalid email or password");
        }
      })
      .catch((err) => {
        console.log(err);
        setErrorMessage("An error occurred. Please try again.");
      });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate("/customer-homepage");
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <GlobalStyle />
      <BackgroundContainer>
        <Grid
          container
          spacing={2}
          sx={{ height: "100%", width: "100%", margin: 0 }}
        >
          <Grid
            item
            xs={12}
            md={4}
            sx={{
              height: "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
            style={{ padding: 0 }}
          >
            <LeftContainer>
              <img src={Image} alt="Mozartify" style={{ width: "50%" }} />
              <Typography
                variant="h3"
                fontWeight="bold"
                sx={{ fontFamily: "Montserrat", ml: 6, mt: -3, color: "#FFFFFF" }}
              >
                Welcome
                <br />
                Back!
              </Typography>
              <HandMusicImage
                src={Image2}
                alt="Hand Music"
              />
            </LeftContainer>
          </Grid>

          <Grid
            item
            xs={12}
            md={8}
            sx={{
              height: "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            style={{ padding: 0 }}
          >
            <FormContainer component="form" onSubmit={handleSubmit}>
              <Typography
                variant="h5"
                align="center"
                fontWeight="bold"
                gutterBottom
                sx={{ fontFamily: "Montserrat", marginBottom: 1 }}
              >
                Hello! Welcome back.
              </Typography>
              <Typography
                variant="body1"
                align="center"
                color="textSecondary"
                sx={{ fontFamily: "Montserrat", marginBottom: 3 }}
              >
                Log in using the information you provided during registration
              </Typography>
              <TextField
                fullWidth
                label="Email Address"
                margin="normal"
                variant="outlined"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  "& label.Mui-focused": { color: "#483C32" },
                  "& .MuiInput-underline:after": {
                    borderBottomColor: "#483C32",
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#483C32" },
                    "&:hover fieldset": { borderColor: "#483C32" },
                    "&.Mui-focused fieldset": { borderColor: "#483C32" },
                  },
                }}
              />
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                margin="normal"
                variant="outlined"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& label.Mui-focused": { color: "#483C32" },
                  "& .MuiInput-underline:after": {
                    borderBottomColor: "#483C32",
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#483C32" },
                    "&:hover fieldset": { borderColor: "#483C32" },
                    "&.Mui-focused fieldset": { borderColor: "#483C32" },
                  },
                }}
              />
              {errorMessage && (
                <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                  {errorMessage}
                </Typography>
              )}
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 2,
                }}
              >
                <Link
                  to="/forgot-password"
                  style={{ textDecoration: "none", color: "#483C32"}}
                >
                  Forgot Password?
                </Link>
              </Box>
              <Button
                variant="outlined"
                size="large"
                type="submit"
                sx={{
                  mt: 5,
                  px: 10,
                  fontFamily: "Montserrat",
                  fontWeight: "bold",
                  color: "#483C32", // Custom text color for outlined button
                  borderColor: "#483C32", // Custom border color for outlined button
                  "&:hover": {
                    backgroundColor: "#483C32",
                    color: "#FFFFFF",
                    borderColor: "#483C32", // Ensures border is also set when hovered
                  },
                }}
              >
                Login Now
              </Button>
              <Typography
                variant="body2"
                align="center"
                sx={{ mt: 2, fontFamily: "Montserrat", color: "#483C32" }}
              >
                Don’t have an account?{" "}
                <Link
                  to="/signup"
                  style={{ textDecoration: "none", color: "#C44131", fontWeight: "bold"}}
                >
                  REGISTER
                </Link>
              </Typography>
            </FormContainer>
          </Grid>
        </Grid>
      </BackgroundContainer>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <ModalContainer>
          <Typography id="modal-title" variant="h6" component="h2">
            Login Successful!
          </Typography>
          <Typography id="modal-description" sx={{ mt: 2 }}>
            You have logged in successfully. Welcome back!
          </Typography>
          <Button onClick={handleCloseModal} sx={{ mt: 2 }} variant="contained">
            OK
          </Button>
        </ModalContainer>
      </Modal>
    </>
  );
}