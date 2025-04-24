import React, { useState } from 'react';

interface PasswordProtectProps {
  children: React.ReactNode;
  correctPassword?: string; // Optional: Allows password override via prop
}

const PasswordProtect: React.FC<PasswordProtectProps> = ({
  children,
  correctPassword = 'perpetua', // Default password
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // State resets on each mount
  const [passwordAttempt, setPasswordAttempt] = useState('');
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordAttempt === correctPassword) {
      setIsAuthenticated(true); // Authenticate for this instance only
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