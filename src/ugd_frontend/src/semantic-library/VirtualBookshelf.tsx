import React, { useEffect, useRef } from 'react';
import '../../styles/VirtualBookshelf.css';
import BookCards from '../cards/BookCards';
import useAuthorBooks from '../../utils/useAuthorBooks';

const VirtualBookShelf = ({ author }: { author: string }) => {
  const booksByThisAuthor = useAuthorBooks(author);
  const carouselWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const adjustScaleBasedOnPosition = () => {
      const currentRef = carouselWrapperRef.current;
      if (currentRef) {
        const cards = currentRef.querySelectorAll('.carousel-card') as NodeListOf<HTMLDivElement>;
        const carouselMidpoint = currentRef.offsetWidth * 0.8 / 2;

        cards.forEach(card => {
          const cardMidpoint = card.getBoundingClientRect().left + card.offsetWidth / 2 - currentRef.getBoundingClientRect().left;
          const distanceFromCenter = Math.abs(carouselMidpoint - cardMidpoint);

          const scale = 1.1 - Math.min(distanceFromCenter / 1000, 0.2);
          card.style.transform = `scale(${scale})`;
        });
      }
    }

    const currentRef = carouselWrapperRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', adjustScaleBasedOnPosition);
      adjustScaleBasedOnPosition();

      return () => {
        currentRef.removeEventListener('scroll', adjustScaleBasedOnPosition);
      }
    }
  }, [carouselWrapperRef, booksByThisAuthor]);

  return (
    <div className="carousel-container scale-down">
      <div className="segment-area">
        <div className="carousel-wrapper" ref={carouselWrapperRef}>
          {booksByThisAuthor.map((book, bookIndex) => (
            <div className="carousel-card" key={bookIndex}>
              <BookCards book={book} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );  
};

export default VirtualBookShelf;
