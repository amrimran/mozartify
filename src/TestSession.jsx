import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
axios.defaults.withCredentials = true;

const TestSession = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get("http://localhost:3000/current-user");
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Error fetching current user:", error);
        alert("An error occurred while fetching the current user. Please log in again.");
        navigate("/login");
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3000/logout");
      setCurrentUser(null);
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name);
          });
        });
      }
      navigate("/login", { replace: true });
      window.history.pushState(null, null, window.location.href);
      window.onpopstate = function () {
        window.history.go(1);
      };
    } catch (error) {
      console.error("Error during logout:", error);
      alert("An error occurred during logout. Please try again.");
    }
  };

  return (
    <div>
      {currentUser ? (
        <div>
          <h1>Welcome, {currentUser.username}!</h1>
          <p>Email: {currentUser.email}</p>
          <p>ID: {currentUser._id}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default TestSession;
