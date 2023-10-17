import React, { useState, useEffect, useRef } from 'react';
import '../../styles/BookCard.css';
import Resizer from 'react-image-file-resizer'
// import placeholderBook from '../../assets/public/bookimages/placeholder-cover.png';

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

  const [compressedImageSrc, setCompressedImageSrc] = useState<string>("");

  // useEffect(() => {
  //   if (image) {
  //     fetch(image)
  //       .then(response => response.blob())
  //       .then(blob => {
  //         Resizer.imageFileResizer(
  //           blob,
  //           300,
  //           300,
  //           'PNG',
  //           90,
  //           0,
  //           (uri) => {
  //             if (typeof uri === 'string') {
  //               setCompressedImageSrc(uri);
  //             }
  //           },
  //           'base64'
  //         );
  //       });
  //   }
  // }, [image]);  

  if (image) {
    fetch(image)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network Response was not okay');
        }
        return response.blob();
      })
      .then(blob => {
        Resizer.imageFileResizer(
          blob,
          300,
          300,
          'PNG',
          90,
          0,
          (uri) => {
            if (typeof uri === 'string') {
              setCompressedImageSrc(uri);
            }
          },
          'base64'
        );
      })
      .catch(error => {
        console.error('There was a problem fetching the image: ', error);
        console.log('Failed image URL:', image);
      });
  }    

  return (
    <div
      className={`BCCard-wrapper w-120 h-120 ${flipped ? 'BCCardFlipped' : ''}`}
      onClick={onCardClick}
    >
      <div className="BCBook-card relative transform-gpu">
        <div className="BCCard-face BCCard-front absolute inset-0 bg-[#fbfbf8] border border-[#252525] rounded-[.5rem] flex flex-col items-center">
          <div className="BCImage-container w-full h-full minus-mb-[25px] overflow-hidden rounded-t-[.5rem] shadow-inner">
            <img src={compressedImageSrc} className="object-cover w-full h-full" alt={title} />
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










