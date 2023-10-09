import React from 'react';
import '../../styles/AuthorCards.css'

interface CardProps {
  image: string;
  title: string;
  onCardClick: () => void;
  flipped: boolean;
  description: string;
}

const AuthorCard: React.FC<CardProps> = ({ image, title, onCardClick, flipped, description }) => {
  // return (
  //     <div
  //       className={`
  //           card-wrapper
  //           ${flipped ? 'cardFlipped' : ''} 
  //         `}
  //       onClick={onCardClick}
  //     >
  //       <div className="author-card relative transform-gpu transition-transform duration-500 ease-in-out">
  //         <div className="card-face card-front absolute inset-0 bg-[#fbfbf8] border border-[#252525] rounded-[.5rem] flex flex-col items-center">
  //           <div className="image-container">
  //             <img src={image} className="object-cover w-full h-full" alt={title} />
  //           </div>
  //           <div className="text-container w-[95%] h-[15px] bg-gray-100 rounded-b-lg flex items-center justify-center">
  //             <p className="overflow-hidden overflow-ellipsis author-name">{title}</p>
  //           </div>
  //         </div>
  //         <div className="card-face card-back absolute inset-0 bg-[#fbfbf8] text-center p-10 overflow-y-auto">
  //           <p className="streamed-description">{description}</p>
  //         </div>
  //       </div>
  //     </div>
  // );
  return (
    <div
      className={`card-wrapper ${flipped ? 'cardFlipped' : ''}`}
      onClick={onCardClick}
    >
      <div className="author-card relative">
        <div className="card-face card-front absolute inset-0 bg-[#fbfbf8] border border-[#252525] rounded-[.5rem] flex flex-col items-center">
          <div className="image-container">
            <img src={image} className="object-cover w-full h-full" alt={title} />
          </div>
          <div className="text-container w-[95%] h-[15px] bg-gray-100 rounded-b-lg flex items-center justify-center">
            <p className="overflow-hidden overflow-ellipsis author-name">{title}</p>
          </div>
        </div>
        <div className="card-face card-back absolute inset-0 bg-[#fbfbf8] text-center p-10 overflow-y-auto">
          <p className="streamed-description">{description}</p>
        </div>
      </div>
    </div>
);

};

export default AuthorCard;