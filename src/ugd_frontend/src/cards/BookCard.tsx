// // OG While flipped-state is here:
// import React, { useState, useEffect, useRef } from 'react';
// import '../../styles/BookCard.css';

// interface CardProps {
//   image: string;
//   title: string;
//   description: string;
// }

// const BCBookCard: React.FC<CardProps> = ({ image, title, description }) => {
//   const [flipped, setFlipped] = useState(false);
//   const titleRef = useRef<HTMLParagraphElement>(null);

//   useEffect(() => {
//     if (titleRef.current) {
//       const element = titleRef.current;
//       if (element.offsetWidth < element.scrollWidth) {
//         element.style.fontSize = 'clamp';
//       }
//     }
//   }, []);

//   const onCardClick = () => {
//     setFlipped(!flipped);
//   };

// let dynamicFontSize = '1.3rem';
// let dynamicLineHeight = 0.8;
// let displayTitle = title;
// const titleLength = title.length;

// const maxTitleLength = 65; 

// for (let i = 0; i < titleLength; i++) {
//   if (i % 5 === 0 && i !== 0) {
//     dynamicFontSize = `${parseFloat(dynamicFontSize) - 0.04}rem`;
//     dynamicLineHeight += 0.03;
//   }

//   if (i >= maxTitleLength) {
//     displayTitle = `${title.substring(0, i)}...`;
//     break;
//   }
// }


//   return (
//     <div
//       className={`BCCard-wrapper w-120 h-120 ${flipped ? 'BCCardFlipped' : ''}`}
//       onClick={onCardClick}
//     >
//       <div className="BCBook-card relative transform-gpu">
//         <div className="BCCard-face BCCard-front absolute inset-0 bg-[#fbfbf8] border border-[#252525] rounded-[.5rem] flex flex-col items-center">
//           <div className="BCImage-container w-full h-full minus-mb-[25px] overflow-hidden rounded-t-[.5rem] shadow-inner">
//             <img src={image} className="object-cover w-full h-full" alt={title} />
//           </div>
//           <div className="BCText-container w-[95%] h-[30px] rounded-b-lg flex items-center justify-center">
//             <p
//               ref={titleRef}
//               style={{ fontSize: dynamicFontSize, lineHeight: dynamicLineHeight }}
//               className="BCAuthor-name text-center"
//             >
//               {displayTitle}
//             </p>
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










import React, { useState, useEffect, useRef } from 'react';
import '../../styles/BookCard.css';
import { handleReadBookClick } from '../../utils/handleReadBookClick';

interface CardProps {
  image: string;
  title: string;
  description: string;
  flipped: boolean;
  onCardClick: () => void;
  onReadBookClick: (event: React.MouseEvent) => void;
}

const BCBookCard: React.FC<CardProps> = ({ image, title, description, flipped, onCardClick, onReadBookClick }) => {
  const titleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      const element = titleRef.current;
      if (element.offsetWidth < element.scrollWidth) {
        element.style.fontSize = 'clamp';
      }
    }
  }, []);

  let dynamicFontSize = '1.3rem';
  let dynamicLineHeight = 0.8;
  let displayTitle = title;
  const titleLength = title.length;

  const maxTitleLength = 65; 

  for (let i = 0; i < titleLength; i++) {
    if (i % 5 === 0 && i !== 0) {
      dynamicFontSize = `${parseFloat(dynamicFontSize) - 0.04}rem`;
      dynamicLineHeight += 0.03;
    }

    if (i >= maxTitleLength) {
      displayTitle = `${title.substring(0, i)}...`;
      break;
    }
  }


  return (
    <div
      className={`BCCard-wrapper w-120 h-120 ${flipped ? 'BCCardFlipped' : ''}`}
      onClick={onCardClick}
    >
      <div className="BCBook-card relative transform-gpu">
        <div className="BCCard-face BCCard-front absolute inset-0 bg-[#fbfbf8] border border-[#252525] rounded-[.5rem] flex flex-col items-center">
          <div className="BCImage-container w-full h-full minus-mb-[25px] overflow-hidden rounded-t-[.5rem] shadow-inner">
            <img src={image} className="object-cover w-full h-full" alt={title} />
          </div>
          <div className="BCText-container w-[95%] h-[30px] rounded-b-lg flex items-center justify-center">
            <p
              ref={titleRef}
              style={{ fontSize: dynamicFontSize, lineHeight: dynamicLineHeight }}
              className="BCAuthor-name text-center"
            >
              {displayTitle}
            </p>
          </div>
        </div>
        <div className="BCCard-face BCCard-back absolute inset-0 bg-[#fbfbf8] text-center p-10 overflow-y-auto">
          <p className="BCStreamed-description">{description}</p>
          <button 
            className="BCReadBook-button" 
            onClick={onReadBookClick}
          >
            Read Book
          </button>
        </div>
      </div>
    </div>
  );
};

export default BCBookCard;