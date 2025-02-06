import React, { useEffect } from "react";
import { useUser } from "@/hooks/actors";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import fetchMyNodes from "@/features/my-nodes/thunks/fetchMyNodes";
import Librarian from "@/features/librarian";

function LibrarianPage() {
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
				<h1 className="text-3xl font-bold text-primary">Librarian Home</h1>
			</div>
			<div className="font-roboto-condensed bg-secondary rounded-lg shadow-md p-6">
				<Librarian />
			</div>
		</>
	)
}

export default LibrarianPage;