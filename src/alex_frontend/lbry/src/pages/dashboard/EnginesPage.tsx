import React, { useEffect } from "react";
import MyEngines from "@/features/my-engines";
import AddEngine from "@/features/my-engines/components/AddEngine";
import fetchMyEngines from "@/features/my-engines/thunks/fetchMyEngines";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useUser } from "@/hooks/actors";

function EnginesPage() {
	const dispatch = useAppDispatch();

	const { actor } = useUser();

	useEffect(()=>{
		if(!actor) return;

		dispatch(fetchMyEngines(actor));
	},[actor, dispatch])

	return (
		<>
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">My Engines</h1>
				<AddEngine />
			</div>
			<div className="font-roboto-condensed bg-white rounded-lg shadow-md p-6">
				<div className="mb-6 text-gray-600 font-roboto-condensed">List of my created engines</div>

				<MyEngines />
			</div>
		</>
	);
}

export default EnginesPage;