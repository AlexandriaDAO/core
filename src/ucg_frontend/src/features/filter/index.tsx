import React, { useEffect } from "react";
import Types from "./components/Types";
import SubTypes from "./components/SubTypes";
import { useAppDispatch } from "src/ucg_frontend/src/store/hooks/useAppDispatch";
import { useAppSelector } from "src/ucg_frontend/src/store/hooks/useAppSelector";
import useSession from "src/ucg_frontend/src/hooks/useSession";
import { message } from "antd";
import performSearch from "../search/thunks/performSearch";

function Filter() {
	const { meiliClient, meiliIndex } = useSession();
	const dispatch = useAppDispatch();
	const { user } = useAppSelector((state) => state.auth);
	const { searchText } = useAppSelector((state) => state.search);


	const {types, subTypes} = useAppSelector(state=>state.filter)
	const search = async()=>{
		if(searchText.length > 0 ){
			if( !user ){
				message.error("Login to perform searches on your engines");
				return;
			}
			if(!meiliClient){
				message.error("Add a working client to perform searches");
				return;
			}

			if(!await meiliClient.isHealthy()){
				message.error("Client not available");
				return;
			}

			if(!meiliIndex){
				message.error("Index not available");
				return;
			}

			dispatch( performSearch({index: meiliIndex}))
		}

	}
	useEffect(() => {
	  search()
	}, [types, subTypes])

	return (
		<div className="flex-grow flex flex-col gap-4 py-4 transition-all duration-200 ease-in">
			<Types />
			<SubTypes />
		</div>
	);
}

export default Filter;
