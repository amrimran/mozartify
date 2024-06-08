import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import Signup from "./Signup";
import Login from "./Login";
import Home from "./Home";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
