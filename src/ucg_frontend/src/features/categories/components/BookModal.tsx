
import { setSelectedBook } from "src/ucg_frontend/src/features/home/homeSlice";
import { useAppDispatch } from "src/ucg_frontend/src/store/hooks/useAppDispatch";
import React from "react";
import BookReader from "src/ucg_frontend/src/components/BookModal";


function BookModal() {
    const dispatch = useAppDispatch();

    const hideSelectedBook = (e: React.MouseEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		dispatch(setSelectedBook(null));
	};

	return (
        <div className="w-full p-10 text-black scale-y-100 transition-all duration-500 flex flex-col justify-between">
            <BookReader />
            {/* <div className="text-black shadow-xl border border-solid rounded-t-lg bg-white scale-y-100 transition-all duration-500 flex-grow flex justify-center items-center">
            </div>
            <div
            onClick={hideSelectedBook}
            className="bg-[#393939] p-4 rounded-bl-lg rounded-br-lg text-white flex justify-center items-center cursor-pointer">
                <svg
                    width="75"
                    height="30"
                    viewBox="0 0 75 30"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M35.0721 0.900502L0.888989 28.7655C0.318339 29.2304 0 29.8482 0 30.4905C0 31.1329 0.318339 31.7506 0.888989 32.2155L0.927614 32.2455C1.20425 32.4717 1.53724 32.6518 1.90632 32.7748C2.27541 32.8979 2.67286 32.9614 3.07452 32.9614C3.47618 32.9614 3.87363 32.8979 4.24272 32.7748C4.6118 32.6518 4.94479 32.4717 5.22143 32.2455L37.4089 6.0055L69.5835 32.2455C69.8602 32.4717 70.1932 32.6518 70.5623 32.7748C70.9313 32.8979 71.3288 32.9614 71.7305 32.9614C72.1321 32.9614 72.5296 32.8979 72.8987 32.7748C73.2677 32.6518 73.6007 32.4717 73.8774 32.2455L73.916 32.2155C74.4866 31.7506 74.805 31.1329 74.805 30.4905C74.805 29.8482 74.4866 29.2304 73.916 28.7655L39.7329 0.900502C39.4323 0.65544 39.0707 0.460344 38.6701 0.327041C38.2695 0.193737 37.8383 0.125 37.4025 0.125C36.9667 0.125 36.5354 0.193737 36.1349 0.327041C35.7343 0.460344 35.3727 0.65544 35.0721 0.900502Z"
                        fill="white"
                    />
                </svg>
            </div> */}
        </div>
	);
}

export default BookModal;
