import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Cancel = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/customer-mycart');
    }, 3000);

    return () => clearTimeout(timer); // Clear timeout if the component is unmounted
  }, [navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Payment Canceled</h1>
      <p>You will be redirected to your cart shortly. Feel free to try again.</p>
    </div>
  );
};

export default Cancel;
