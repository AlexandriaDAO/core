import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useEffect } from "react";

import AddEngine from "./components/AddEngine";
import EngineItem from "./components/EngineItem";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import fetchMyEngines from "./thunks/fetchMyEngines";
import logout from "../auth/thunks/logout";
import { getAuthClient } from "../auth/utils/authUtils";
import { LoaderCircle } from "lucide-react";

function MyEngines() {
	const dispatch = useAppDispatch();

	const { user } = useAppSelector((state) => state.auth);
	const { engines, loading } = useAppSelector((state) => state.myEngines);

	useEffect(()=>{
		if(!user) return;
		const fetchEngines = async ()=>{
			const client = await getAuthClient()
			const authenticated = await client.isAuthenticated()

			if(authenticated){
				dispatch(fetchMyEngines());
			}else if(user!= ''){
				dispatch(logout(client))
			}
		}
		fetchEngines();
	},[user])

	return (
		<div className="w-full p-3 flex gap-2 flex-col shadow-lg rounded-xl bg-white">
			<div className="flex justify-between items-center">
				<div className="font-syne font-medium text-xl text-black">
					Created Engines
				</div>
				<AddEngine />
			</div>
			<div className="flex flex-col gap-4 justify-start items-center">
				{loading ? (
					<LoaderCircle size={30} className="animate animate-spin" />
				) : engines.length <= 0 ? (
					<span>No Engine Created</span>
				) : (
					engines
						.map(engine => (
							<EngineItem key={engine.id} engine={engine} />
						))
				)}
			</div>
		</div>
	);
}

export default MyEngines;
