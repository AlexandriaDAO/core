import React, { useEffect } from "react";
import Types from "./components/Types";
import SubTypes from "./components/SubTypes";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import useSession from "@/hooks/useSession";
import { toast } from "sonner";
import performSearch from "../search/thunks/performSearch";

function Filter() {
	const { meiliClient, meiliIndex } = useSession();
	const dispatch = useAppDispatch();
	const { user } = useAppSelector((state) => state.auth);
	const { searchText } = useAppSelector((state) => state.search);


	const {types, subTypes} = useAppSelector(state=>state.filter)
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
				// toast.error("Index not available");
				// return;
				dispatch( performSearch({indices: [meiliIndex]}))
			}else{
				const indices = await meiliClient.getIndexes();
				dispatch( performSearch({indices: indices.results}))
			}
		}

	}
	useEffect(() => {
	  search()
	}, [types, subTypes])

	return (
		<div className="flex-grow flex flex-col gap-4 py-4 transition-all duration-200 ease-in">
			<Types />
			{/* <SubTypes /> */}
		</div>
	);
}

export default Filter;
