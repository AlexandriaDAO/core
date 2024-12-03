import React, { useEffect } from "react";
import { useUser } from "@/hooks/actors";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import fetchMyNodes from "@/features/my-nodes/thunks/fetchMyNodes";
import MyNodes from "@/features/my-nodes";
import AddNode from "@/features/my-nodes/components/AddNode";

function NodesPage() {
	const {actor} = useUser();

	const dispatch = useAppDispatch();

	const { user } = useAppSelector((state) => state.auth);

	useEffect(()=>{
		if(!actor) return;
		dispatch(fetchMyNodes(actor));
	},[user])

	return (
		<>
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">My Nodes</h1>
				<AddNode />
			</div>
			<div className="font-roboto-condensed bg-white rounded-lg shadow-md p-6">
				<MyNodes />
			</div>
		</>
	)
}

export default NodesPage;