import React, { useState, useEffect } from 'react';
import AuthorCards from './AuthorCards';
import '../../styles/AuthorCards.css';
import { useResetCards } from '../contexts/CardStateContext';

function AuthorPanel({ authors }) {
  const [activeAuthor, setActiveAuthor] = useState(null);
  const resetCards = useResetCards();

  useEffect(() => {
    setActiveAuthor(null);
    resetCards();
  }, []);

  const handleCardClick = (authorId) => {
    setActiveAuthor(authorId === activeAuthor ? null : authorId);
  };

  return (
    <div className="grid">
      {authors.map((author) => (
        <div key={author.id} onClick={() => handleCardClick(author.id)}>
          <AuthorCards 
            author={author} 
            expanded={activeAuthor === author.id} 
          />
        </div>
      ))}
    </div>
  );
}

export default AuthorPanel;








