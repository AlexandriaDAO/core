import React, { useState, useEffect } from 'react';

interface PasswordProtectProps {
  children: React.ReactNode;
  correctPassword?: string; // Optional: Allows password override via prop
}

const PasswordProtect: React.FC<PasswordProtectProps> = ({
  children,
  correctPassword = 'perpetua', // Default password
}) => {
  const authStorageKey = 'passwordAuthStatus';
  const oneDayInMs = 24 * 60 * 60 * 1000;

  // Initialize state based on localStorage, only checking on the client side.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordAttempt, setPasswordAttempt] = useState('');

  useEffect(() => {
    // localStorage is only available in the browser
    try {
      const storedAuth = localStorage.getItem(authStorageKey);
      if (storedAuth) {
        const { expiry } = JSON.parse(storedAuth);
        if (expiry && expiry > Date.now()) {
          setIsAuthenticated(true); // Set authenticated if valid and not expired
        } else {
          // Clear expired entry
          localStorage.removeItem(authStorageKey);
        }
      }
    } catch (error) {
      console.error("Error reading authentication status from localStorage", error);
      // If error (e.g., parsing), ensure not authenticated and potentially clear storage
      localStorage.removeItem(authStorageKey);
      setIsAuthenticated(false); 
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordAttempt === correctPassword) {
      // Set auth status in localStorage with expiry
      const expiry = Date.now() + oneDayInMs;
      localStorage.setItem(authStorageKey, JSON.stringify({ expiry }));
      setIsAuthenticated(true); // Update component state
      // No longer setting showPrompt or sessionStorage here
    } else {
      alert('Incorrect password.');
      setPasswordAttempt(''); // Clear the input field
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated, always show the prompt
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column' }}>
      <h2>Enter Password</h2>
      <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="password"
          value={passwordAttempt}
          onChange={(e) => setPasswordAttempt(e.target.value)}
          placeholder="Password"
          style={{ padding: '8px', fontSize: '1rem' }}
          autoFocus
        />
        <button type="submit" style={{ padding: '8px 12px', fontSize: '1rem' }}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default PasswordProtect; 