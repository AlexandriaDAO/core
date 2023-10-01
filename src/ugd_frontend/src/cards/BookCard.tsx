// import React from 'react';
// import '../../styles/BookCard.css'

// interface CardProps {
//   image: string;
//   title: string;
//   onCardClick: () => void;
//   flipped: boolean;
//   description: string;
// }

// const BCBookCard: React.FC<CardProps> = ({ image, title, onCardClick, flipped, description }) => {
//   return (
//     <div
//       className={`
//           BCCard-wrapper 
//           ${flipped ? 'BCCardFlipped transform rotate-y-180' : ''} 
//           transition-transform duration-500 ease-in-out 
//           perspective-[1000px] w-150 h-150
//         `}
//       onClick={onCardClick}
//     >
//       <div className="BCBook-card relative transform-gpu transition-transform duration-500 ease-in-out">
//         <div className="BCCard-face BCCard-front absolute inset-0 bg-[#fbfbf8] border border-[#252525] rounded-[.5rem] flex flex-col items-center">
//           <div className="BCImage-container w-full h-full minus-mb-[25px] overflow-hidden rounded-t-[.5rem] shadow-inner">
//             <img src={image} className="object-cover w-full h-full" alt={title} />
//           </div>
//           <div className="BCText-container w-[95%] h-[15px] bg-gray-100 rounded-b-lg flex items-center justify-center">
//             <p className="overflow-hidden overflow-ellipsis BCAuthor-name">{title}</p>
//           </div>
//         </div>
//         <div className="BCCard-face BCCard-back absolute inset-0 bg-[#fbfbf8] text-center p-10 overflow-y-auto">
//           <p className="BCStreamed-description">{description}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BCBookCard;









import React, {useState} from 'react';
import '../../styles/BookCard.css';

interface CardProps {
  image: string;
  title: string;
//   onCardClick: () => void;
//   flipped: boolean;
  description: string;
}

const BCBookCard: React.FC<CardProps> = ({ image, title, description }) => {
    const [flipped, setFlipped] = useState(false);
  
    const onCardClick = () => {
      setFlipped(!flipped);
    };

  return (
    <div
    className={`BCCard-wrapper w-150 h-150 ${flipped ? 'BCCardFlipped' : ''}`}
    onClick={onCardClick}
    >
      <div className="BCBook-card relative transform-gpu">
        <div className="BCCard-face BCCard-front absolute inset-0 bg-[#fbfbf8] border border-[#252525] rounded-[.5rem] flex flex-col items-center">
          <div className="BCImage-container w-full h-full minus-mb-[25px] overflow-hidden rounded-t-[.5rem] shadow-inner">
            <img src={image} className="object-cover w-full h-full" alt={title} />
          </div>
          <div className="BCText-container w-[95%] h-[15px] bg-gray-100 rounded-b-lg flex items-center justify-center">
            <p className="overflow-hidden overflow-ellipsis BCAuthor-name">{title}</p>
          </div>
        </div>
        <div className="BCCard-face BCCard-back absolute inset-0 bg-[#fbfbf8] text-center p-10 overflow-y-auto">
          <p className="BCStreamed-description">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default BCBookCard;















// // BookCard.tsx
// import React from 'react';

// interface CardProps {
//   image: string;
//   title: string;
//   onCardClick: () => void;
//   flipped: boolean;
//   description: string;
// }

// const BookCard: React.FC<CardProps> = ({ image, title, onCardClick, flipped, description }) => {
//   return (
//     <div onClick={onCardClick}>
//       <div>
//         {/* Display the book image */}
//         <img src={image} alt={title} />
//       </div>
//       <div>
//         {/* Display the book title */}
//         <p>{title}</p>
//       </div>
//       {/* Flip the card if 'flipped' is true */}
//       {flipped && (
//         <div>
//           {/* Display the description */}
//           <p>{description}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BookCard;
