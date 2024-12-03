import React, { useEffect } from "react";
import EngineOverview from "@/features/engine-overview";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/lib/components/button";
import fetchEngine from "@/features/engine-overview/thunks/fetchEngine";
import { useUser } from "@/hooks/actors";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";

function EngineOverviewPage() {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	const {id} = useParams()
	const {actor} = useUser()

	useEffect(()=>{
		if(!id || !actor) return;

		dispatch(fetchEngine({actor, id}))
	}, [id, actor])

	return (
		<>
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">Engine Overview</h1>
				<Button onClick={()=>navigate(-1)} variant="link" rounded="full" scale="icon" className="p-2">
					<ArrowLeft size={20}/>
				</Button>
			</div>
			<div className="font-roboto-condensed bg-white rounded-lg shadow-md p-6">
				<div className="mb-6 text-gray-600 font-roboto-condensed">Overview of selected Engine</div>

				<EngineOverview />
			</div>
		</>
	);
}

export default EngineOverviewPage;