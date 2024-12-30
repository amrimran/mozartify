import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_51PasSzKz82emZBquVY2tgNeEDGaWk2w76e9bixlKlRZwj8tMl37FlPYCCVi8jgq5V5pJmRHHfpjSWg7uMvcLRNfr00isc5wxRN");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Elements stripe={stripePromise}>
      <App />
    </Elements>
  </React.StrictMode>
);



