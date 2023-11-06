import React, { useEffect, useRef, useState } from 'react';
import '../../styles/AuthorShelf.css';
import BookCards from "../../cards/BookCards";
import useAuthorBooks from '../../utils/useAuthorBooks';
import { useAuthors } from '../../contexts/AuthorContext';
import './author.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import ReactSlider from '../ReactSlider/ReactSlider'
import { SwiperSlide } from "swiper/react";


const Shelf = () => {
  const { shelf } = useAuthors();
  const PrevRef = useRef(null);
  const NextRef = useRef(null);

  const booksByThisAuthor = useAuthorBooks(shelf);


  return (
    <div className="mainShelfContainer">
      <div className="innerShelfContainer">
        <div className="shelfContainerHeader">
          <h2>Books Shelf</h2>
          <div className="carouselBtnsShelf">
            <button className='slideHelfBtns prev' ref={PrevRef}><FontAwesomeIcon icon={faChevronLeft} size='sm' /></button>
            <button className='slideHelfBtns next' ref={NextRef}><FontAwesomeIcon icon={faChevronRight} size='sm' /></button>
          </div>
        </div>


        <div className="innerBooksShelfCarousel">

          <ReactSlider PrevRef={PrevRef} NextRef={NextRef} >
            {booksByThisAuthor.map((book, bookIndex) => (
              <SwiperSlide key={bookIndex}>
                <BookCards book={book} />
              </SwiperSlide>
            ))}
          </ReactSlider>
        </div>


      </div>
    </div>
  );
};

export default Shelf;


