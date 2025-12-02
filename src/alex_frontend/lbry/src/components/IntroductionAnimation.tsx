import React, { useEffect } from 'react';

interface IntroductionAnimationProps {
  isOpen: boolean;
  onClose: () => void;
}

const IntroductionAnimation: React.FC<IntroductionAnimationProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      // Ensure the message is from a trusted source if needed,
      // though for 'introductionComplete' from a child iframe, '*' is often acceptable.
      if (event.data === 'introductionComplete') {
        onClose();
      }
    };

    window.addEventListener('message', handleMessage);

    // Clean up
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000, // Ensure it's above other content
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#000', // Background for the iframe container
        border: 'none',
        pointerEvents: 'none', // Add this to allow clicks to pass through to the iframe
      }}>
        <iframe
          src="/introduction/index.html"
          title="Introduction Animation"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            pointerEvents: 'auto', // Ensure iframe itself can receive pointer events
            zIndex: 1, // Add zIndex to the iframe itself
          }}
          // sandbox="allow-scripts allow-same-origin allow-popups allow-forms" // Remove sandbox attribute
        />
        {/* <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '10px 15px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            color: '#000',
            border: '1px solid #000',
            borderRadius: '5px',
            cursor: 'pointer',
            zIndex: 1001, // Above the iframe
            fontSize: '16px',
            pointerEvents: 'auto', // Ensure the button remains clickable
          }}
        >
          Close (X)
        </button> */}
      </div>
    </div>
  );
};

export default IntroductionAnimation; 