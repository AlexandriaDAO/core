import React, { useState, useEffect, useRef } from 'react';
import '../../styles/VirtualBookshelf.css';
import BookCards from '../cards/BookCards';
import { Book } from '../cards/MessageCard/types';
import { useAuthors } from '../contexts/AuthorContext';

const VirtualBookShelfComponent = ({ author }: { author: string }) => {
  const [groupedBooks, setGroupedBooks] = useState<{ [author: string]: Book[] }>({});
  const booksByThisAuthor = groupedBooks[author] || [];
  const carouselWrapperRef = useRef<HTMLDivElement | null>(null);
  const { authors } = useAuthors();

  const sanitizeTitleForPath = (title: string): string => {
    return title
      .replace(/,/g, '')
      .replace(/;/g, '')
      .replace(/-/g, '')
      .replace(/\./g, '')
      .replace(/—/g, '')
      .replace(/&/g, 'and');
  };  
  
  useEffect(() => {
    const authorInfo = authors.find(info => info.id === author);
    const booksForAuthor: Book[] = [];

    authorInfo?.books?.forEach((title, index) => {
      booksForAuthor.push({
        author: author,
        description: authorInfo.book_descriptions?.[index] || "Description not available",
        categories: authorInfo.category || [],
        imagePath: `/bookimages/${author}/${sanitizeTitleForPath(title)}.png`,
        title: title,
      });
    });

    setGroupedBooks({ [author]: booksForAuthor });
  }, [author, authors]);

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

export default VirtualBookShelfComponent;
