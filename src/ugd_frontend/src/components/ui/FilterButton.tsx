import { setFilter } from "@/features/home/homeSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React from "react";

export default function FilterButton() {
	const dispatch = useAppDispatch();
	const { filter } = useAppSelector((state) => state.home);

	const handleFilterClick = () => {
		dispatch(setFilter(!filter));
	};

	return (
		<button
			onClick={handleFilterClick}
			className={`cursor-pointer w-40 h-auto font-syne font-bold flex justify-left items-center gap-2.5 p-4 border border-solid border-black rounded-3xl  ${
				filter
					? "text-white bg-black hover:text-gray-200"
					: "text-gray-600 hover:text-black hover:bg-gray-200"
			}`}
		>
			<svg
            className="w-10"
				fill="currentColor"
				viewBox="-2 0 19 19"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
				<g
					id="SVGRepo_tracerCarrier"
					strokeLinecap="round"
					strokeLinejoin="round"
				></g>
				<g id="SVGRepo_iconCarrier">
					<path d="M14.546 6.201a.554.554 0 0 1-.554.554h-1.79a2.22 2.22 0 0 1-4.298 0H1.008a.554.554 0 0 1 0-1.108h6.896a2.22 2.22 0 0 1 4.299 0h1.789a.554.554 0 0 1 .554.554zm0 3.7a.554.554 0 0 1-.554.554H6.987a2.22 2.22 0 0 1-4.298 0h-1.68a.554.554 0 0 1 0-1.108h1.68a2.22 2.22 0 0 1 4.298 0h7.005a.554.554 0 0 1 .554.554zm0 3.7a.554.554 0 0 1-.554.555h-1.79a2.22 2.22 0 0 1-4.298 0H1.008a.554.554 0 0 1 0-1.109h6.896a2.22 2.22 0 0 1 4.299 0h1.789a.554.554 0 0 1 .554.554zm-8.597-3.7a1.11 1.11 0 1 0-1.111 1.111 1.112 1.112 0 0 0 1.11-1.11zm5.215-3.7a1.111 1.111 0 1 0-1.11 1.11 1.112 1.112 0 0 0 1.11-1.11zm0 7.4a1.111 1.111 0 1 0-1.11 1.111 1.112 1.112 0 0 0 1.11-1.11z"></path>
				</g>
			</svg>
			<span className="text-2xl leading-7 text-center tracking-wider">
				Filter
			</span>
		</button>
	);
}
