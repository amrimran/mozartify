import React, { useState } from "react";
import axios from "axios";
import { Box, Typography, TextField, Button } from "@mui/material";
import { styled } from "@mui/system";
import { createGlobalStyle } from "styled-components";
import { Link } from "react-router-dom";
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
  backgroundPosition: "right",
  minHeight: "100vh",
  width: "100vw",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
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

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3001/forgot-password", { email })
      .then((response) => {
        setMessage("If this email is registered, you will receive a password reset link.");
      })
      .catch((error) => {
        setMessage("An error occurred. Please try again.");
      });
  };

  return (
    <>
      <GlobalStyle />
      <BackgroundContainer>
        <FormContainer component="form" onSubmit={handleSubmit}>
          <Typography
            variant="h5"
            align="center"
            fontWeight="bold"
            gutterBottom
            sx={{ fontFamily: "Montserrat", marginBottom: 1 }}
          >
            Forgot Password
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="textSecondary"
            sx={{ fontFamily: "Montserrat", marginBottom: 3 }}
          >
            Enter your email to request a password reset link
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
          {message && (
            <Typography color="textPrimary" variant="body2" sx={{ mt: 2 }}>
              {message}
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
            Submit
          </Button>
          <Link
            to="/login"
            style={{ textDecoration: "none", color: "#C44131", fontWeight: "bold", marginTop: "20px" }}
          >
            BACK TO LOGIN
          </Link>
        </FormContainer>
      </BackgroundContainer>
    </>
  );
}
