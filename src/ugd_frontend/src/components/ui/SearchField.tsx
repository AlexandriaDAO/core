import { setSearch, setView } from "@/features/home/homeSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, {
	ChangeEvent,
	KeyboardEvent,
} from "react";
import { IoIosSearch } from "react-icons/io";
import { RxCross1 } from "react-icons/rx";

export default function SearchField() {
	const dispatch = useAppDispatch();
	const { search, filter } = useAppSelector((state) => state.home);

	const handleSearchInput = (e: ChangeEvent<HTMLInputElement>) => {
		dispatch(setSearch(e.target.value));
	};
	// Handler for key down events
	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		// Check if the Enter key was pressed
		if (e.key === "Enter") {
			console.log("Enter key pressed!");
			console.log(search);

			dispatch(setView("loading"));
			setTimeout(() => {
				dispatch(setView("search"));
			}, 1000);
		}
	};
	const handleClearSearchInput = () => {
		dispatch(setSearch(""));
		dispatch(setView("home"));
	};

	return (
		<div
			className={`basis-[800px] flex-shrink h-auto flex justify-between items-center gap-2.5 p-4 border-b border-solid ${
				filter
					? "border-b-white text-white"
					: "border-b-black text-gray-600"
			}`}
		>
			<input
				className="bg-transparent flex-grow text-2xl font-syne font-bold leading-7  tracking-wider ring-0 focus:ring-0 outline-none"
				placeholder="Ask me anything..."
				value={search}
				onKeyDown={handleKeyDown}
				onChange={handleSearchInput}
			/>

			{search.length > 0 ? <RxCross1 onClick={handleClearSearchInput} className="cursor-pointer" size={30}/> : <IoIosSearch size={30} />}
		</div>
	);
}
