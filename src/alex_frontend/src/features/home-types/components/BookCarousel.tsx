import React, { useState, useRef, useEffect, LegacyRef } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import BookCard from "./BookCard";

export default function BooksCarousel() {

    const dispatch = useAppDispatch();
    const {selectedBook, selectedType} = useAppSelector(state=>state.home)

	const { books } = useAppSelector(
		(state) => state.portal
	);

	const leftRef = useRef<HTMLButtonElement>(null);
	const rightRef = useRef<HTMLButtonElement>(null);

	const filteredBooks = books.filter(book => book.type === selectedType);

    if (filteredBooks.length === 0) {
        return <div className="flex justify-center items-center bg-white py-16 px-10 font-roboto-condensed text-lg leading-[18px] text-black font-semibold">
			No Books available for this Type.
		</div>
    }

	// Calculate the number of books that can fit based on breakpoints
    const getBooksPerView = () => {
        const width = window.innerWidth;
        if (width >= 1280) return 6;
        if (width >= 1025) return 5;
        if (width >= 768) return 4;
        if (width >= 640) return 3;
        return 2; // Default for smaller screens
    };

    const booksPerView = getBooksPerView();

    // Check if there are enough books to show the arrows
    const showArrows = filteredBooks.length > booksPerView;

	return (
		<div className=" bg-white py-16 px-10 gap-4 text-black grid grid-cols-[auto_1fr_auto] items-center">
			<button
				disabled={!showArrows}
				ref={leftRef}
				className={`flex justify-center items-center p-2 border border-solid border-black rounded-full ${showArrows ? 'cursor-pointer':'opacity-50 cursor-not-allowed'}`}
			>
				<svg
					width="30"
					height="30"
					viewBox="0 0 30 26"
					fill="currentColor"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M13.1617 1.08745C13.3372 1.26323 13.4359 1.50151 13.4359 1.74995C13.4359 1.99838 13.3372 2.23667 13.1617 2.41245L3.51324 12.0624L28.7492 12.0624C28.9978 12.0624 29.2363 12.1612 29.4121 12.337C29.5879 12.5128 29.6867 12.7513 29.6867 12.9999C29.6867 13.2486 29.5879 13.487 29.4121 13.6629C29.2363 13.8387 28.9978 13.9374 28.7492 13.9374L3.51324 13.9374L13.1617 23.5874C13.3273 23.7652 13.4174 24.0002 13.4131 24.2431C13.4089 24.486 13.3105 24.7177 13.1387 24.8895C12.9669 25.0612 12.7352 25.1596 12.4923 25.1639C12.2495 25.1682 12.0144 25.078 11.8367 24.9124L0.586675 13.6624C0.411112 13.4867 0.3125 13.2484 0.3125 12.9999C0.3125 12.7515 0.411112 12.5132 0.586675 12.3374L11.8367 1.08745C12.0125 0.911882 12.2507 0.813271 12.4992 0.813271C12.7476 0.813271 12.9859 0.911882 13.1617 1.08745Z"
						fill="currentColor"
					/>
				</svg>
			</button>
            <div className="w-auto overflow-hidden">
                <Swiper
                    className="flex items-center"
                    modules={[Navigation]}
                    navigation={{
                        prevEl: leftRef.current,
                        nextEl: rightRef.current,
                    }}
                    spaceBetween={10}
                    breakpoints={{
						1280: {
                            slidesPerView: 6,
                            spaceBetween: 30,
						},
                        1025: {
                            slidesPerView: 5,
                            spaceBetween: 20,
                        },

                        768: {
                            slidesPerView: 4,
                            spaceBetween: 15,
                        },

                        640: {
                            slidesPerView: 3,
                            spaceBetween: 12,
                        },

                        480: {
                            slidesPerView: 2,
                            spaceBetween: 10,
                        },
                    }}
                    slidesPerView={1}
                    pagination={{ clickable: true }}
                    onBeforeInit={(swip:any) => {
                        swip.params.navigation.prevEl = leftRef.current;
                        swip.params.navigation.nextEl = rightRef.current;
                    }}
                >
                    {filteredBooks
						.map((book, index) => (
							<SwiperSlide key={book.manifest}>
								<BookCard book={book} />
							</SwiperSlide>
                    ))}
                </Swiper>
            </div>
			<button
				disabled={!showArrows}
				ref={rightRef}
				className={`flex justify-center items-center p-2 border border-solid border-black rounded-full ${showArrows ? 'cursor-pointer':'opacity-50 cursor-not-allowed'}`}
			>
				<svg
					width="30"
					height="30"
					viewBox="0 0 30 26"
					fill="currentColor"
					xmlns="http://www.w3.org/2000/svg"
					className=" transform rotate-180"
				>
					<path
						d="M13.1617 1.08745C13.3372 1.26323 13.4359 1.50151 13.4359 1.74995C13.4359 1.99838 13.3372 2.23667 13.1617 2.41245L3.51324 12.0624L28.7492 12.0624C28.9978 12.0624 29.2363 12.1612 29.4121 12.337C29.5879 12.5128 29.6867 12.7513 29.6867 12.9999C29.6867 13.2486 29.5879 13.487 29.4121 13.6629C29.2363 13.8387 28.9978 13.9374 28.7492 13.9374L3.51324 13.9374L13.1617 23.5874C13.3273 23.7652 13.4174 24.0002 13.4131 24.2431C13.4089 24.486 13.3105 24.7177 13.1387 24.8895C12.9669 25.0612 12.7352 25.1596 12.4923 25.1639C12.2495 25.1682 12.0144 25.078 11.8367 24.9124L0.586675 13.6624C0.411112 13.4867 0.3125 13.2484 0.3125 12.9999C0.3125 12.7515 0.411112 12.5132 0.586675 12.3374L11.8367 1.08745C12.0125 0.911882 12.2507 0.813271 12.4992 0.813271C12.7476 0.813271 12.9859 0.911882 13.1617 1.08745Z"
						fill="currentColor"
					/>
				</svg>
			</button>
		</div>
	);
}
