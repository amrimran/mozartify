import React from "react";
import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormGroup,
  Modal,
} from "@mui/material";
import { styled } from "@mui/system";
import { createGlobalStyle } from "styled-components";
import Image from "./assets/mozartify.png"; // Update with the appropriate path
import backgroundImage from "./assets/signupWP.png"; // Update with the appropriate path

const FormContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#FFFFFF",
  borderRadius: 10,
  boxShadow: "0px 3px 6px rgba(0,0,0,1)",
  padding: 40,
  width: "100%",
  maxWidth: 400,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
}));

const BackgroundContainer = styled(Box)(() => ({
  backgroundImage: `url(${backgroundImage})`,
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundAttachment: "fixed",
  backgroundPosition: "bottom",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "0 20px",
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
}));

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    setErrorMessage(""); // Clear any previous error messages
    axios
      .post("http://localhost:3001/signup", { username, email, password })
      .then((result) => {
        console.log(result);
        setIsModalOpen(true); // Show the success modal
      })
      .catch((err) => {
        if (err.response && err.response.data && err.response.data.message) {
          setErrorMessage(err.response.data.message);
          console.log(err.response.data.message); // Log only the error message
        } else {
          setErrorMessage("An error occurred. Please try again.");
          console.log("An error occurred. Please try again."); // Log a general error message
        }
      });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate("/login"); // Navigate to login page after closing the modal
  };

  return (
    <>
      <GlobalStyle />
      <BackgroundContainer>
        <Grid container spacing={2} sx={{ height: "100%", width: "100%" }}>
          <Grid
            item
            xs={12}
            md={5}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FormContainer component="form" onSubmit={handleSubmit}>
              <Typography
                variant="h5"
                align="center"
                fontFamily="Montserrat"
                fontWeight="bold"
                gutterBottom
                sx={{ marginBottom: 7 }}
              >
                Please fill this form to create an account
              </Typography>

              <TextField
                fullWidth
                label="Username"
                margin="normal"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                type="password"
                margin="normal"
                variant="outlined"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                label="Confirm Password"
                type="password"
                margin="normal"
                variant="outlined"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

              <Button
                variant="outlined"
                size="large"
                type="submit"
                sx={{
                  mt: 5,
                  px: 10,
                  fontFamily: "Montserrat",
                  color: "#483C32", // Custom text color for outlined button
                  borderColor: "#483C32", // Custom border color for outlined button
                  "&:hover": {
                    backgroundColor: "#483C32",
                    color: "#FFFFFF",
                    borderColor: "#483C32", // Ensures border is also set when hovered
                  },
                }}
              >
                Sign Up
              </Button>

              <Typography
                variant="body2"
                align="center"
                sx={{ mt: 2, fontFamily: "Montserrat", color: "#483C32" }}
              >
                Already have an account?{" "}
                <Link
                  href="/login"
                  sx={{
                    fontFamily: "Montserrat",
                    color: "#C44131",
                    fontWeight: "bold",
                  }}
                >
                  LOGIN
                </Link>
              </Typography>
            </FormContainer>
          </Grid>

          <Grid
            item
            xs={12}
            md={7}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FormContainer>
              <Typography
                variant="h6"
                align="center"
                fontWeight="bold"
                gutterBottom
              >
                Hello! Welcome back.
              </Typography>
              <Typography
                variant="body2"
                align="center"
                color="textSecondary"
                sx={{ mb: 3 }}
              >
                Login with the data you entered during registration
              </Typography>

              <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  margin="normal"
                  variant="outlined"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#CCCCCC" },
                      "&:hover fieldset": { borderColor: "#000000" },
                      "&.Mui-focused fieldset": { borderColor: "#000000" },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  margin="normal"
                  variant="outlined"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#CCCCCC" },
                      "&:hover fieldset": { borderColor: "#000000" },
                      "&.Mui-focused fieldset": { borderColor: "#000000" },
                    },
                  }}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    mt: 1,
                  }}
                >
                  <Link
                    href="#"
                    variant="body2"
                    sx={{ color: "#000000", textDecoration: "none" }}
                  >
                    Forgot Password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    mt: 3,
                    backgroundColor: "#000000",
                    color: "#FFFFFF",
                    "&:hover": {
                      backgroundColor: "#333333",
                    },
                  }}
                >
                  Login Now
                </Button>
              </form>

              <Typography
                variant="body2"
                align="center"
                sx={{ mt: 2 }}
              >
                Don’t have an account?{" "}
                <Link
                  href="/register"
                  sx={{
                    color: "#000000",
                    fontWeight: "bold",
                  }}
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
            Sign-Up Successful!
          </Typography>
          <Typography id="modal-description" sx={{ mt: 2 }}>
            Your account has been created successfully. Please check your email
            for the verification link.
          </Typography>
          <Button onClick={handleCloseModal} sx={{ mt: 2 }} variant="contained">
            OK
          </Button>
        </ModalContainer>
      </Modal>
    </>
  );
}
