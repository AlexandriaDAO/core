import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { ChangeEvent, KeyboardEvent, useEffect } from "react";
import { RxCross1 } from "react-icons/rx";
import { setLimit, setSearchResults, setSearchText } from "./searchSlice";

import { ImSpinner8 } from "react-icons/im";
import FilterButton from "@/components/ui/FilterButton";
import useSession from "@/hooks/useSession";
import { message } from "antd";
import performSearch from "./thunks/performSearch";

export default function Search() {
	const { meiliClient, meiliIndex } = useSession();
	const dispatch = useAppDispatch();
	const { user } = useAppSelector((state) => state.auth);
	const { searchText, limit, loading } = useAppSelector((state) => state.search);

	const handleSearchInput = (e: ChangeEvent<HTMLInputElement>) => {
		dispatch(setSearchText(e.target.value));
	};

	const search = async()=>{
		if(searchText.length > 0 ){
			// if( !user ){
			// 	message.error("Login to perform searches on your engines");
			// 	return;
			// }
			if(!meiliClient){
				message.error("Add a working client to perform searches");
				return;
			}

			if(!await meiliClient.isHealthy()){
				message.error("Client not available");
				return;
			}

			if(meiliIndex){
				dispatch( performSearch({indices: [meiliIndex]}))
			}else{
				const indices = await meiliClient.getIndexes();
				dispatch( performSearch({indices: indices.results}))
			}
		}else{
			handleClearSearchInput()
		}
	}
	useEffect(()=>{
		search();
	},[searchText, limit])

	// // Handler for key down events
	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		// Check if the Enter key was pressed
		if (e.key === "Enter") search();
	};
	const handleClearSearchInput = () => {
		dispatch(setSearchText(""));
		dispatch(setSearchResults([]));
		dispatch(setLimit(20));
	};

	return (
		<div
			className="basis-[750px] flex-shrink h-auto flex justify-between items-center gap-2.5 p-4 bg-[#D2D2D2] rounded"
		>
			<div className="flex-grow flex justify-between items-center border-r border-solid border-black pr-2">
				<input
					className="text-[#717171] bg-transparent flex-grow text-2xl font-syne font-bold leading-7  tracking-wider ring-0 focus:ring-0 outline-none"
					placeholder="Ask me anything..."
					value={searchText}
					onKeyDown={handleKeyDown}
					onChange={handleSearchInput}
				/>
				{loading && <ImSpinner8 size={24} className="animate animate-spin" />}
				{!loading && searchText.length > 0 && (
					<RxCross1
						onClick={handleClearSearchInput}
						className="cursor-pointer"
						size={24}
					/>
				)}
			</div>
			<FilterButton />
		</div>
	);
}
