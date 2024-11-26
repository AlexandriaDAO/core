import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { ChangeEvent, KeyboardEvent, useEffect } from "react";
import { setLimit, setSearchResults, setSearchText } from "./searchSlice";

import useSession from "@/hooks/useSession";
import { toast } from "sonner";
import performSearch from "./thunks/performSearch";
import { ChevronDown, ChevronUp, LoaderCircle, X } from "lucide-react";
import { setFilter } from "../home/homeSlice";

export default function Search() {
	const { meiliClient, meiliIndex } = useSession();
	const dispatch = useAppDispatch();
	const { searchText, limit, loading } = useAppSelector((state) => state.search);
	const { filter } = useAppSelector((state) => state.home);

	const handleSearchInput = (e: ChangeEvent<HTMLInputElement>) => {
		dispatch(setSearchText(e.target.value));
	};

	const search = async()=>{
		if(searchText.length > 0 ){
			// if( !user ){
			// 	toast.error("Login to perform searches on your engines");
			// 	return;
			// }
			if(!meiliClient){
				toast.error("Add a working client to perform searches");
				return;
			}

			if(!await meiliClient.isHealthy()){
				toast.error("Client not available");
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
				{loading && <LoaderCircle size={24} className="animate animate-spin" />}
				{!loading && searchText.length > 0 && (
					<X
						onClick={handleClearSearchInput}
						className="cursor-pointer"
						size={24}
					/>
				)}
			</div>
			<button
				onClick={()=>dispatch(setFilter(!filter))}
				className="cursor-pointer px-4 gap-4 h-auto font-roboto-condensed font-normal text-base flex items-center text-black hover:text-gray-700"
			>
				<span className="text-2xl leading-7 text-center tracking-wider">
					Filter
				</span>
				{filter ? <ChevronUp size={20}/> : <ChevronDown size={20} />}
			</button>
		</div>
	);
}
