// import React, { useState } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";
// import { Box, Typography, TextField, Button } from "@mui/material";
// import { styled } from "@mui/system";
// import { createGlobalStyle } from "styled-components";
// import backgroundImage from "./assets/loginWP.png";

// const FormContainer = styled(Box)(({ theme }) => ({
//   backgroundColor: "#FFFFFF",
//   borderRadius: "20px",
//   boxShadow: "0px 3px 6px rgba(0,0,0,1)",
//   padding: 80,
//   width: "60%",
//   display: "flex",
//   flexDirection: "column",
//   justifyContent: "center",
//   alignItems: "center",
//   fontFamily: "Montserrat",
// }));

// const BackgroundContainer = styled(Box)(() => ({
//   backgroundColor: "#f5f5f5",
//   backgroundImage: `url(${backgroundImage})`,
//   backgroundSize: "cover",
//   backgroundRepeat: "no-repeat",
//   backgroundAttachment: "fixed",
//   backgroundPosition: "right",
//   minHeight: "100vh",
//   width: "100vw",
//   display: "flex",
//   justifyContent: "center",
//   alignItems: "center",
//   flexDirection: "column",
//   margin: 0,
//   overflow: "hidden",
//   fontFamily: "Montserrat",
// }));

// const GlobalStyle = createGlobalStyle`
//   body {
//     margin: 0;
//     padding: 0;
//     font-family: 'Montserrat', sans-serif;
//   }
// `;

// export default function ResetPassword() {
//   const { token } = useParams();
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (password !== confirmPassword) {
//       setError("Passwords do not match");
//       return;
//     }

//     axios
//       .post(`http://localhost:3000/reset-password/${token}`, { password })
//       .then((response) => {
//         setMessage("Your password has been successfully reset.");
//         setError("");
//         setTimeout(() => {
//           navigate("/login");
//         }, 3000);
//       })
//       .catch((error) => {
//         setMessage("");
//         setError("An error occurred. Please try again.");
//       });
//   };

//   return (
//     <>
//       <GlobalStyle />
//       <BackgroundContainer>
//         <FormContainer component="form" onSubmit={handleSubmit}>
//           <Typography
//             variant="h5"
//             align="center"
//             fontWeight="bold"
//             gutterBottom
//             sx={{ fontFamily: "Montserrat", marginBottom: 1 }}
//           >
//             Reset Password
//           </Typography>
//           <Typography
//             variant="body1"
//             align="center"
//             color="textSecondary"
//             sx={{ fontFamily: "Montserrat", marginBottom: 3 }}
//           >
//             Enter your new password below.
//           </Typography>
//           <TextField
//             fullWidth
//             label="New Password"
//             type="password"
//             margin="normal"
//             variant="outlined"
//             required
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             sx={{
//               "& label.Mui-focused": { color: "#483C32" },
//               "& .MuiInput-underline:after": {
//                 borderBottomColor: "#483C32",
//               },
//               "& .MuiOutlinedInput-root": {
//                 "& fieldset": { borderColor: "#483C32" },
//                 "&:hover fieldset": { borderColor: "#483C32" },
//                 "&.Mui-focused fieldset": { borderColor: "#483C32" },
//               },
//             }}
//           />
//           <TextField
//             fullWidth
//             label="Confirm New Password"
//             type="password"
//             margin="normal"
//             variant="outlined"
//             required
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             sx={{
//               "& label.Mui-focused": { color: "#483C32" },
//               "& .MuiInput-underline:after": {
//                 borderBottomColor: "#483C32",
//               },
//               "& .MuiOutlinedInput-root": {
//                 "& fieldset": { borderColor: "#483C32" },
//                 "&:hover fieldset": { borderColor: "#483C32" },
//                 "&.Mui-focused fieldset": { borderColor: "#483C32" },
//               },
//             }}
//           />
//           {message && (
//             <Typography color="primary" variant="body2" sx={{ mt: 2 }}>
//               {message}
//             </Typography>
//           )}
//           {error && (
//             <Typography color="error" variant="body2" sx={{ mt: 2 }}>
//               {error}
//             </Typography>
//           )}
//           <Button
//             variant="outlined"
//             size="large"
//             type="submit"
//             sx={{
//               mt: 5,
//               px: 10,
//               fontFamily: "Montserrat",
//               fontWeight: "bold",
//               color: "#483C32", 
//               borderColor: "#483C32",
//               "&:hover": {
//                 backgroundColor: "#483C32",
//                 color: "#FFFFFF",
//                 borderColor: "#483C32",
//               },
//             }}
//           >
//             Reset Password
//           </Button>
//         </FormContainer>
//       </BackgroundContainer>
//     </>
//   );
// }

import React, { useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const query = new URLSearchParams(useLocation().search);
  const token = query.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/reset-password', { token, newPassword: password });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response.data.message || 'An error occurred');
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>New Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Reset Password</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ResetPassword;
