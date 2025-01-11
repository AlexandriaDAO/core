import React, { useState, useEffect } from "react";
import { Link } from 'react-router';
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { size } from "viem/_types";

interface App {
  name: string;
  description: string;
  path: string;
  logo?: string;
  comingSoon?: boolean;
}

const apps: App[] = [
  { name: 'Alexandrian', description: 'Library', path: '/app/alexandrian', logo: '/logos/alexandrian.jpg' },
  { name: 'Permasearch', description: 'Explore', path: '/app/permasearch', logo: '/logos/permasearch.jpg', comingSoon: true },
  { name: 'Emporium', description: 'Trade', path: '/app/emporium', logo: '/logos/emporium.jpg' },
  { name: 'Syllogos', description: 'Aggregate', path: '/app/syllogos', logo: '/logos/syllogos.jpg', comingSoon: true },
  { name: 'Bibliotheca', description: 'Library', path: '/app/bibliotheca', comingSoon: true },
  { name: 'Lexigraph', description: 'Write', path: '/app/lexigraph', comingSoon: true },
  { name: 'Dialectica', description: 'Debate', path: '/app/dialectica', comingSoon: true },
];

const HomePage: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDiscover = () => {
    setIsPanelOpen(true);
  };

  useEffect(() => {
    if (user) {
      setIsPanelOpen(true);
    }
  }, [user]);

  return (
    <>
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
            // fontSize: '80px',
            fontWeight: 800,
            textTransform: 'uppercase',
            margin: '0 0 20px 0',
            fontSize: 'clamp(25px, 6vw, 80px)',
            
          }}>

            Alexandria
          </h1>
          <p style={{
            color: '#1E1E1E',
            fontFamily: 'Montserrat, sans-serif',
            // fontSize: '50px',
            fontSize: 'clamp(18px, 4vw, 50px)',

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
              // fontSize: '24px',
              fontSize: 'clamp(14px, 4vw, 24px)',
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
          padding: isMobile ? '20px 0' : '40px 0',
          transition: 'transform 0.5s ease-in-out',
          transform: isPanelOpen ? 'translateY(-100%)' : 'translateY(0)',
          overflowY: 'auto',
        }}>
          <h2 style={{
            alignSelf: 'stretch',
            color: '#1E1E1E',
            fontFamily: 'Syne, sans-serif',
            // fontSize: '60px',
            fontSize: 'clamp(30px, 6vw, 60px)',
            fontWeight: 600,
            lineHeight: 'normal',
            margin: 0,
            textAlign:'center',
          }}>
            explore our apps
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: isMobile ? '10px' : '20px',
            width: '100%',
            maxWidth: '1200px',
            padding: '0 10px',
            marginTop: '40px',
          }}>
            {apps.map((app) => (
              <Link 
                to={app.comingSoon ? '#' : app.path} 
                key={app.name} 
                style={{ textDecoration: 'none', width: '100%' }}
                onClick={(e) => app.comingSoon && e.preventDefault()}
              >
                <div style={{
                  width: '100%',
                  height: 'auto',
                  minHeight: '140px',
                  padding: '8px',
                  borderRadius: '16px',
                  background: app.comingSoon ? '#F5F5F5' : '#FFF',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  cursor: app.comingSoon ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.2s',
                  opacity: app.comingSoon ? 0.7 : 1,
                }}>
                  <div style={{
                    width: isMobile ? '80px' : '120px',
                    height: isMobile ? '80px' : '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '4px 0',
                  }}>
                    {app.comingSoon ? (
                      <div style={{
                        color: '#848484',
                        fontFamily: 'Syne, sans-serif',
                        fontSize: '14px',
                        fontWeight: 600,
                        textAlign: 'center',
                      }}>
                        COMING<br />SOON
                      </div>
                    ) : (
                      <img 
                        src={app.logo}
                        alt={`${app.name} logo`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          padding: '8px',
                        }}
                      />
                    )}
                  </div>
                  <div style={{
                    color: '#000',
                    fontFamily: 'Syne, sans-serif',
                    fontSize: isMobile ? '14px' : '18px',
                    fontWeight: 700,
                    lineHeight: 'normal',
                  }}>
                    {app.name}
                  </div>
                  <div style={{
                    color: '#848484',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: isMobile ? '12px' : '14px',
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
    </>
  );
};

export default HomePage;
