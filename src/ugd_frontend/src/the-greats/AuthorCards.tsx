import React from 'react';
import useStreamingText from '../../utils/Stream';
import { useCardState } from '../contexts/CardStateContext';
import VirtualBookShelfComponent from '../semantic-library/VirtualBookshelf';
import '../../styles/AuthorCards.css';

interface AuthorCardsProps {
  author: {
    id: string;
    description: string;
    categories: string[];
  };
  expanded: boolean;
}

const AuthorCards: React.FC<AuthorCardsProps> = ({ author, expanded }) => {
  const { cardState, flipCard } = useCardState(author.id);
  const streamedDescription = useStreamingText(author.description, 15, cardState.startStreaming || false);

  const handleClick = () => {
    flipCard();
  };

  return (
    <>
      <div className={`author-container flex ${expanded ? 'expanded' : ''}`}>
        <div className={`card-wrapper ${expanded ? 'cardFlipped' : ''}`}>
        <div className="author-card" onClick={handleClick}>
            <div className="card-face card-front">
              <div className="image-container w-full h-32 rounded-t-lg overflow-hidden shadow-inner">
                <img src={`/images/${author.id}.png`} className="object-cover min-w-full min-h-full" alt={`${author.id}`} />
              </div>
              <div className="text-container w-full h-8 flex items-center justify-center bg-gray-100 rounded-b-lg">
                <p className="text-xs font-semibold text-gray-700">{`${author.id}`}</p>
              </div>
            </div>
            <div className="card-face card-back">
              <div className="extension">
                <div className={`virtual-bookshelf-container transform transition-transform duration-500 ease-in-out ${expanded ? 'translate-x-0' : '-translate-x-full'}`}>
                  {expanded && <VirtualBookShelfComponent author={author.id} />}
                </div> 
              </div> 
              {/* Here you can put the content of the back side */}
            </div>
           </div>
        </div>
      </div>
    </>
  );
};              

export default AuthorCards;



{/* <div className={`virtual-bookshelf-container transform transition-transform duration-500 ease-in-out ${expanded ? 'translate-x-0' : '-translate-x-full'}`}>
  {expanded && <VirtualBookShelfComponent author={author.id} />}
</div> */}