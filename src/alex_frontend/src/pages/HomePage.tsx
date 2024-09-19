import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import MainLayout from "@/layouts/MainLayout";
import { useAppSelector } from "@/store/hooks/useAppSelector";

interface App {
  name: string;
  description: string;
  path: string;
}

const apps: App[] = [
  { name: 'Bibliotheca', description: 'Library', path: '/app/bibliotheca' },
  { name: 'Syllogos', description: 'Aggregate', path: '/app/syllogos' },
  { name: 'Lexigraph', description: 'Write', path: '/app/lexigraph' },
  { name: 'Dialectica', description: 'Debate', path: '/app/dialectica' },
  { name: 'Alexandrian', description: 'Explore', path: '/app/alexandrian' },
  { name: 'Emporium', description: 'Trade', path: '/app/emporium' },
];

const HomePage: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  const handleDiscover = () => {
    setIsPanelOpen(true);
  };

  useEffect(() => {
    if (user) {
      setIsPanelOpen(true);
    }
  }, [user]);

  return (
    <MainLayout>
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        height: '100vh',
      }}>
        {/* First Panel */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          backgroundColor: '#FFFFFF',
          transition: 'transform 0.5s ease-in-out',
          transform: isPanelOpen ? 'translateY(-100%)' : 'translateY(0)',
        }}>
          <h1 style={{
            color: '#1E1E1E',
            fontFamily: 'Syne, sans-serif',
            fontSize: '80px',
            fontWeight: 800,
            textTransform: 'uppercase',
            margin: '0 0 20px 0',
          }}>
            Alexandria
          </h1>
          <p style={{
            color: '#1E1E1E',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '50px',
            fontWeight: 400,
            textTransform: 'lowercase',
            margin: '0 0 40px 0',
          }}>
            a sane way to use the internet
          </p>
          <button
            onClick={handleDiscover}
            style={{
              display: 'flex',
              padding: '20px 40px',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '20px',
              borderRadius: '50px',
              border: '1px solid #1E1E1E',
              background: '#1E1E1E',
              color: '#FFF',
              fontFamily: 'Syne, sans-serif',
              fontSize: '24px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Discover
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(90deg)' }}>
              <path d="M6.38909 0.192139C6.18752 0.192139 5.98125 0.271826 5.82656 0.426514C5.51719 0.735889 5.51719 1.24214 5.82656 1.55151L16.4156 12.1406L5.98125 22.575C5.67187 22.8843 5.67187 23.3906 5.98125 23.7C6.29062 24.0093 6.79688 24.0093 7.10625 23.7L18.1078 12.7031C18.4172 12.3937 18.4172 11.8875 18.1078 11.5781L6.95625 0.426514C6.79688 0.267139 6.59534 0.192139 6.38909 0.192139Z" fill="white"/>
            </svg>
          </button>
        </div>
        {/* Second Panel */}
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '40px',
          transition: 'transform 0.5s ease-in-out',
          transform: isPanelOpen ? 'translateY(-100%)' : 'translateY(0)',
          overflowY: 'auto',
        }}>
          <h2 style={{
            alignSelf: 'stretch',
            color: '#1E1E1E',
            fontFamily: 'Syne, sans-serif',
            fontSize: '60px',
            fontWeight: 600,
            lineHeight: 'normal',
            margin: 0,
          }}>
            explore our apps
          </h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            marginTop: '40px',
          }}>
            {apps.map((app) => (
              <Link to={app.path} key={app.name} style={{ textDecoration: 'none' }}>
                <div style={{
                  width: '194px',
                  height: '260px',
                  flexShrink: 0,
                  borderRadius: '24px',
                  background: '#FFF',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}>
                  <div style={{
                    color: '#036',
                    fontFamily: 'Syne, sans-serif',
                    fontSize: '24px',
                    fontWeight: 800,
                    lineHeight: 'normal',
                  }}>
                    LOGO
                  </div>
                  <div style={{
                    color: '#000',
                    fontFamily: 'Syne, sans-serif',
                    fontSize: '20px',
                    fontWeight: 700,
                    lineHeight: 'normal',
                  }}>
                    {app.name}
                  </div>
                  <div style={{
                    color: '#848484',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: 'normal',
                  }}>
                    {app.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;
