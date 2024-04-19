import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { ChangeEvent, KeyboardEvent, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { RxCross1 } from "react-icons/rx";
import { setSearchResults, setSearchText } from "./searchSlice";

import useMeili from "@/hooks/useMeili";
import { ImSpinner8 } from "react-icons/im";

export default function Search() {
	const { performSearch } = useMeili();
	const dispatch = useAppDispatch();
	const { filter } = useAppSelector((state) => state.home);
	const { searchText, loading } = useAppSelector((state) => state.search);

	const handleSearchInput = (e: ChangeEvent<HTMLInputElement>) => {
		dispatch(setSearchText(e.target.value));
	};

	useEffect(()=>{
		if(searchText.length > 0){
			performSearch()
		}else{
			handleClearSearchInput()
		}
	},[searchText])

	// Handler for key down events
	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		// Check if the Enter key was pressed
		if (e.key === "Enter") performSearch();
	};
	const handleClearSearchInput = () => {
		dispatch(setSearchText(""));
		dispatch(setSearchResults([]));
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
				value={searchText}
				onKeyDown={handleKeyDown}
				onChange={handleSearchInput}
			/>
			{loading ? (
				<ImSpinner8 size={30} className="animate animate-spin" />
			) : searchText.length > 0 ? (
				<RxCross1
					onClick={handleClearSearchInput}
					className="cursor-pointer"
					size={30}
				/>
			) : (
				<IoIosSearch size={30} />
			)}
		</div>
	);
}
