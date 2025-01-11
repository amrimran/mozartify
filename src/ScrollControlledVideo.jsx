import React, { useRef, useEffect, useState } from 'react';
import vid1 from './assets/vid1.mp4';

const ScrollControlledVideo = () => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const handleScroll = (e) => {
      e.preventDefault();
      const scrollAmount = e.deltaY;
      const newTime = video.currentTime + (scrollAmount / 500);
      video.currentTime = Math.max(0, Math.min(newTime, video.duration));
    };

    const handleVideoLoaded = () => {
      setIsLoaded(true); // Fixed syntax error here
      video.pause();
    };

    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.height = '100vh';

    container.addEventListener('wheel', handleScroll, { passive: false });
    video.addEventListener('loadeddata', handleVideoLoaded);

    return () => {
      container.removeEventListener('wheel', handleScroll);
      video.removeEventListener('loadeddata', handleVideoLoaded);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* Video Container */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0
      }}>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          playsInline
          muted
        >
          <source src={vid1} type="video/mp4" />
        </video>
        {/* Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }} />
      </div>

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        color: 'white'
      }}>
        {/* Navigation */}
        <nav style={{
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Your Logo</div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Home</a>
            <a href="#" style={{ color: 'white', textDecoration: 'none' }}>About</a>
            <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Services</a>
            <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Contact</a>
          </div>
        </nav>

        {/* Main Content */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <h1 style={{
            fontSize: '3.5rem',
            marginBottom: '1.5rem',
            maxWidth: '800px'
          }}>
            Welcome to the Future of Design
          </h1>
          
          <p style={{
            fontSize: '1.25rem',
            marginBottom: '2rem',
            maxWidth: '600px'
          }}>
            Scroll to explore our journey through innovative design and creative solutions.
            We transform ideas into captivating digital experiences.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'white',
              color: 'black',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}>
              Get Started
            </button>
            <button style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid white',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}>
              Learn More
            </button>
          </div>
        </main>

        {/* Scroll Indicator */}
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center'
        }}>
          <p style={{ marginBottom: '0.5rem' }}>Scroll to Control Video</p>
          <div>↓</div>
        </div>
      </div>
    </div>
  );
};

export default ScrollControlledVideo;