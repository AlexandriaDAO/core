import { setFilter } from "@/features/home/homeSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

export default function FilterButton() {
	const dispatch = useAppDispatch();
	const { filter } = useAppSelector((state) => state.home);

	const handleFilterClick = () => {
		dispatch(setFilter(!filter));
	};

	return (
		<button
			onClick={handleFilterClick}
			className="cursor-pointer px-4 gap-4 h-auto font-roboto-condensed font-normal text-base flex items-center text-black hover:text-gray-700"
		>
			<span className="text-2xl leading-7 text-center tracking-wider">
				Filter
			</span>
			{filter ? <IoIosArrowUp size={20}/> : <IoIosArrowDown size={20} />}
		</button>
	);
}
