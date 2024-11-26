import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useEffect } from "react";

import AddEngine from "./components/AddEngine";
import EngineItem from "./components/EngineItem";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import fetchMyEngines from "./thunks/fetchMyEngines";
import { LoaderCircle } from "lucide-react";
import { useUser } from "@/hooks/actors";

import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/lib/components/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/lib/components/tabs";
import PublishedEngines from "./components/PublishedEngines";
import DraftedEngines from "./components/DraftedEngines";


function MyEngines() {
	const dispatch = useAppDispatch();

	const { actor } = useUser();
	const { engines, loading } = useAppSelector((state) => state.myEngines);

	useEffect(()=>{
		if(!actor) return;

		dispatch(fetchMyEngines(actor));
	},[actor, dispatch])

	if(loading) return (
		<div className="flex justify-start items-center gap-1">
			<span>Loading Engines</span>
			<LoaderCircle size={20} className="animate animate-spin" />
		</div>
	)

	if(engines.length<=0) return <span>No Engine Created</span>

	return (
		// <div className="w-full p-3 flex gap-2 flex-col shadow-lg rounded-xl bg-white">
		// 	<div className="flex justify-between items-center">
		// 		<div className="font-syne font-medium text-xl text-black">
		// 			Created Engines
		// 		</div>
		// 		<AddEngine />
		// 	</div>
		// 	<div className="flex flex-col gap-4 justify-start items-center">
		// 		{loading ? (
		// 			<LoaderCircle size={30} className="animate animate-spin" />
		// 		) : engines.length <= 0 ? (
		// 			<span>No Engine Created</span>
		// 		) : (
		// 			engines
		// 				.map(engine => (
		// 					<EngineItem key={engine.id} engine={engine} />
		// 				))
		// 		)}
		// 	</div>

		<Tabs defaultValue="published" className="">
			<TabsList>
				<TabsTrigger value="published">Published Engines</TabsTrigger>
				<TabsTrigger value="drafted">Drafted Engines</TabsTrigger>
			</TabsList>
			<TabsContent value="published" className="my-6"><PublishedEngines /></TabsContent>
			<TabsContent value="drafted" className="my-6"><DraftedEngines /></TabsContent>
		</Tabs>

		// </div>
	);
}

export default MyEngines;
