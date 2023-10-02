// import React, {useState} from 'react';
// import '../../styles/BookCard.css';

// interface CardProps {
//   image: string;
//   title: string;
//   description: string;
// }

// const BCBookCard: React.FC<CardProps> = ({ image, title, description }) => {
//     const [flipped, setFlipped] = useState(false);

//     const onCardClick = () => {
//       setFlipped(!flipped);
//     };

//     const titleLength = title.length;
//     const dynamicFontSize = titleLength > 50 ? '14px' : '18px';

//   return (
//     // <div
//     // className={`BCCard-wrapper w-150 h-150 ${flipped ? 'BCCardFlipped' : ''}`}
//     // onClick={onCardClick}
//     // >

//         <div
//         className={`BCCard-wrapper w-120 h-120 ${flipped ? 'BCCardFlipped' : ''}`}
//         onClick={onCardClick}
//         >
//       <div className="BCBook-card relative transform-gpu">
//         <div className="BCCard-face BCCard-front absolute inset-0 bg-[#fbfbf8] border border-[#252525] rounded-[.5rem] flex flex-col items-center">
//           <div className="BCImage-container w-full h-full minus-mb-[25px] overflow-hidden rounded-t-[.5rem] shadow-inner">
//             <img src={image} className="object-cover w-full h-full" alt={title} />
//           </div>
//           {/* <div className="BCText-container w-[95%] h-[15px] bg-gray-100 rounded-b-lg flex items-center justify-center">
//             <p className="overflow-hidden overflow-ellipsis BCAuthor-name">{title}</p>
//           </div> */}
//           {/* <div className="BCText-container w-[95%] h-[30px] bg-gray-100 rounded-b-lg flex items-center justify-center">
//   <div className="BCTwoLineTitle">
//     <p className="overflow-hidden BCAuthor-name">{title}</p>
//   </div>
// </div> */}
// {/* <div className="BCText-container w-[95%] h-[30px] bg-gray-100 rounded-b-lg flex items-center justify-center">
//   <div className="BCTwoLineTitle">
//     {title}
//   </div>
// </div> */}
//       <div className="BCText-container w-[95%] h-[30px] bg-gray-100 rounded-b-lg flex items-center justify-center">
//         <p className="overflow-hidden overflow-ellipsis BCAuthor-name" style={{fontSize: dynamicFontSize}}>
//           {title}
//         </p>
//       </div>


//         </div>
//         <div className="BCCard-face BCCard-back absolute inset-0 bg-[#fbfbf8] text-center p-10 overflow-y-auto">
//           <p className="BCStreamed-description">{description}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BCBookCard;








// import React, {useState, useEffect, useRef} from 'react';
// import '../../styles/BookCard.css';

// interface CardProps {
//   image: string;
//   title: string;
//   description: string;
// }

// const BCBookCard: React.FC<CardProps> = ({ image, title, description }) => {
//     const [flipped, setFlipped] = useState(false);
//     const titleRef = useRef<HTMLParagraphElement>(null);
  
//     useEffect(() => {
//         if (titleRef.current) {
//           const element = titleRef.current;
//           if (element.offsetWidth < element.scrollWidth) {
//             element.style.fontSize = 'clamp';
//           }
//         }
//       }, []);

//     const onCardClick = () => {
//       setFlipped(!flipped);
//     };

//     let dynamicFontSize = '1.3rem'; // Start at 1.3rem (20.8px)
//     let displayTitle = title; // Initialize with the full title
//     const titleLength = title.length;
  
//     for (let i = 5; i <= titleLength; i += 5) {
//       dynamicFontSize = `${parseFloat(dynamicFontSize) - 0.05}rem`; // Decrement by 0.05rem for every 5 characters
//       if (parseFloat(dynamicFontSize) <= 0.6) { // Stop at 0.6rem
//         dynamicFontSize = '0.6rem';
//         displayTitle = `${title.substring(0, i - 5)}...`; // Truncate and append ...
//         break;
//       }
//     }

//   return (
//         <div
//         className={`BCCard-wrapper w-120 h-120 ${flipped ? 'BCCardFlipped' : ''}`}
//         onClick={onCardClick}
//         >
//       <div className="BCBook-card relative transform-gpu">
//         <div className="BCCard-face BCCard-front absolute inset-0 bg-[#fbfbf8] border border-[#252525] rounded-[.5rem] flex flex-col items-center">
//         <div className="BCImage-container w-full h-full minus-mb-[25px] overflow-hidden rounded-t-[.5rem] shadow-inner">
//           <img src={image} className="object-cover w-full h-full" alt={title} />
//         </div>
//         <div className="BCText-container w-[95%] h-[30px] rounded-b-lg flex items-center justify-center">
//         <p
//           ref={titleRef}
//           style={{ fontSize: dynamicFontSize }}
//           className="BCAuthor-name text-center"
//         >
//           {displayTitle}
//         </p>
//       </div>
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

interface CardProps {
  image: string;
  title: string;
  description: string;
}

const BCBookCard: React.FC<CardProps> = ({ image, title, description }) => {
  const [flipped, setFlipped] = useState(false);
  const titleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      const element = titleRef.current;
      if (element.offsetWidth < element.scrollWidth) {
        element.style.fontSize = 'clamp';
      }
    }
  }, []);

  const onCardClick = () => {
    setFlipped(!flipped);
  };

//   let dynamicFontSize = '1.3rem'; // Start at 1.3rem (20.8px)
//   let dynamicLineHeight = 0.8; // Starting line height as a float (closer to CSS unitless line-height)
//   let displayTitle = title; // Initialize with the full title
//   const titleLength = title.length;
  
//   for (let i = 5; i <= titleLength; i += 5) {
//     dynamicFontSize = `${parseFloat(dynamicFontSize) - 0.06}rem`; // Decrement by 0.05rem for every 5 characters
//     dynamicLineHeight += 0.04; // Increment line height by 0.05 for every 5 characters to make the text more breathable
  
//     if (parseFloat(dynamicFontSize) <= 1.1) { // Stop at 0.6rem
//       dynamicFontSize = '0.8rem';
//       displayTitle = `${title.substring(0, i - 5)}...`; // Truncate and append ...
//     }
//   }

let dynamicFontSize = '1.3rem'; // Start at 1.3rem (20.8px)
let dynamicLineHeight = 0.8; // Starting line height as a float (closer to CSS unitless line-height)
let displayTitle = title; // Initialize with the full title
const titleLength = title.length;

// Maximum allowable title length before truncation
const maxTitleLength = 65; 

for (let i = 0; i < titleLength; i++) {
  if (i % 5 === 0 && i !== 0) {
    dynamicFontSize = `${parseFloat(dynamicFontSize) - 0.04}rem`; // Decrement by 0.05rem for every 5 characters
    dynamicLineHeight += 0.03; // Increment line height by 0.05 for every 5 characters to make the text more breathable
  }

  if (i >= maxTitleLength) {
    displayTitle = `${title.substring(0, i)}...`; // Truncate and append ...
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
        </div>
      </div>
    </div>
  );
};

export default BCBookCard;
















// import React, { useState, useEffect, useRef } from 'react';
// import '../../styles/BookCard.css';

// interface CardProps {
//   image: string;
//   title: string;
//   description: string;
// }

// const BCBookCard: React.FC<CardProps> = ({ image, title, description }) => {
//     const [flipped, setFlipped] = useState(false);
//     const titleRef = useRef<HTMLParagraphElement>(null);
//     const [dynamicFontSize, setDynamicFontSize] = useState('20.8px'); // Start at 20.8px
//     const [dynamicLineHeight, setDynamicLineHeight] = useState(0.8); // Starting line height as a float
//     const [displayTitle, setDisplayTitle] = useState(title); // Initialize with the full title
  
//     useEffect(() => {
//       if (titleRef.current) {
//         const element = titleRef.current;
//         const maxWidth = element.parentElement?.offsetWidth; // Get parent width
  
//         while (element.offsetWidth > (maxWidth || 0)) {
//           const currentFontSize = parseFloat(getComputedStyle(element).fontSize);
//           if (currentFontSize <= 9.6) { // Stop at 9.6px (0.6rem)
//             setDynamicFontSize('9.6px');
//             setDisplayTitle(`${title.substring(0, Math.floor(element.offsetWidth / (maxWidth || 1) * title.length))}...`); // Truncate and append ...
//             break;
//           } else {
//             const newFontSize = currentFontSize - 0.8; // Decrement by 0.8px
//             setDynamicFontSize(`${newFontSize}px`);
//             setDynamicLineHeight(dynamicLineHeight + 0.05); // Increment line height by 0.05
//           }
//         }
//       }
//     }, [dynamicLineHeight, title]);
  
//     const onCardClick = () => {
//       setFlipped(!flipped);
//     };

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
