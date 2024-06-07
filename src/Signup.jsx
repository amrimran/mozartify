// import axios from "axios";
// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { useNavigate } from 'react-router-dom';
import React from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Grid,
} from "@mui/material";
import { styled } from "@mui/system";
import { createGlobalStyle } from "styled-components";
import Image from "./assets/mozartify.png";
import Image2 from "./assets/handrock.png";
import backgroundImage from "./assets/signupWP.png";

const FormContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#FFFFFF",
  borderRadius: 50,
  boxShadow: "0px 3px 6px rgba(0,0,0,1)",
  padding: 80,
  width: "60%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
}));

const BackgroundContainer = styled(Box)(() => ({
  backgroundImage: `url(${backgroundImage})`,
  backgroundSize: "cover", // Ensure the background image covers the entire area
  backgroundRepeat: "no-repeat", // Prevent the background image from repeating
  backgroundAttachment: "fixed", // Keep the background image fixed in place
  backgroundPosition: "bottom", // Center the background image
  minHeight: "100vh",
  width: "100vw",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  flexDirection: "row",
  margin: 0,
  overflow: "hidden",
}));

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
  }
`;

export default function Signup() {
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
            md={8}
            sx={{
              height: "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            style={{ padding: 0 }}
          >
            <FormContainer>
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
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                margin="normal"
                variant="outlined"
                required
              />
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                margin="normal"
                variant="outlined"
                required
              />
              <Button
                variant="outlined"
                size="large"
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
            md={4}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "right",
              alignItems: "right",
              margin: 0,
            }}
            style={{ padding: 0 }}
          >
            <Box
              sx={{
                marginLeft: { xs: 0, md: 4 },
                textAlign: "center",
              }}
            >
              <Box sx={{ mt: 2 }} style={{ padding: 0 }}>
                <img src={Image} alt="Mozartify" style={{ width: "100%" }} />
              </Box>
              <Typography
                variant="h3"
                color="white"
                fontWeight="bold"
                align="center"
                sx={{ mt: 2 }}
              >
                Welcome to
                <br />
                Mozartify
              </Typography>
              <Box sx={{ mt: 2 }}>
                <img
                  src={Image2}
                  alt="Mozartify"
                  style={{ width: "100%", maxWidth: "400px" }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </BackgroundContainer>
    </>
  );
}

// function Signup() {
//   const [name, setName] = useState();
//   const [email, setEmail] = useState();
//   const [password, setPassword] = useState();
//   const navigate = useNavigate()

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     axios
//       .post('http://localhost:3001/signup', { name, email, password })
//       .then((result) => {console.log(result)
//         navigate('/login')
//       })
//       .catch((err) => console.log(err));
//   };

//   return (
//     // <div>
//     //   <div className="bg-white p-3 rounded w-25">
//     //     <h2>Register</h2>
//     //     <form onSubmit={handleSubmit}>
//     //       <div className="mb-3">
//     //         <label htmlFor="name">
//     //           <strong>Name</strong>
//     //         </label>
//     //         <input
//     //           type="text"
//     //           placeholder="Enter Name"
//     //           autoComplete="off"
//     //           name="name"
//     //           className="form-control rounded-0"
//     //           onChange={(e) => setName(e.target.value)}
//     //         />
//     //       </div>
//     //       <div className="mb-3">
//     //         <label htmlFor="email">
//     //           <strong>Email</strong>
//     //         </label>
//     //         <input
//     //           type="email"
//     //           placeholder="Enter Email"
//     //           autoComplete="off"
//     //           name="email"
//     //           className="form-control rounded-0"
//     //           onChange={(e) => setEmail(e.target.value)}
//     //         />
//     //       </div>
//     //       <div className="mb-3">
//     //         <label htmlFor="password">
//     //           <strong>Password</strong>
//     //         </label>
//     //         <input
//     //           type="password"
//     //           placeholder="Enter Password"
//     //           autoComplete="off"
//     //           name="password"
//     //           className="form-control rounded-0"
//     //           onChange={(e) => setPassword(e.target.value)}
//     //         />
//     //       </div>
//     //       <button type="submit" className="btn btn-success w-100 rounded-0">
//     //         Register
//     //       </button>
//     //     </form>
//     //     <p>Already Have an Account</p>
//     //     <Link
//     //       to="/login"
//     //       className="btn btn-default border w-100 bg-light rounded-0 text-decoration-none"
//     //     >
//     //       Login
//     //     </Link>
//     //   </div>
//     // </div>
//   );
// }
