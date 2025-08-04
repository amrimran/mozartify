import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL} from './config/api.js';

const Success = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const completePurchase = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/complete-purchase`);
        console.log('Purchase completion response:', response.data);
      } catch (error) {
        console.error('Error completing purchase:', error);
      }
    };

    // Call the function to complete the purchase
    completePurchase();

    // Redirect to the cart after 3 seconds
    const timer = setTimeout(() => {
      navigate('/customer-mycart');
    }, 3000);

    return () => clearTimeout(timer); // Clear timeout if the component is unmounted
  }, [navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Payment Successful!</h1>
      <p>Thank you for your purchase. You will be redirected to your cart shortly.</p>
    </div>
  );
};

export default Success;
