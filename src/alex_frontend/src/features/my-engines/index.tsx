import { useAppSelector } from "@/store/hooks/useAppSelector";
import React from "react";

import { LoaderCircle } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/lib/components/tabs";
import PublishedEngines from "./components/PublishedEngines";
import DraftedEngines from "./components/DraftedEngines";

function MyEngines() {
	const { engines, loading } = useAppSelector((state) => state.myEngines);

	if(loading) return (
		<div className="flex justify-start items-center gap-1">
			<span>Loading Engines</span>
			<LoaderCircle size={20} className="animate animate-spin" />
		</div>
	)

	if(engines.length<=0) return <span>No Engine Created</span>

	return (
		<Tabs defaultValue="published" className="">
			<TabsList>
				<TabsTrigger value="published">Published Engines</TabsTrigger>
				<TabsTrigger value="drafted">Drafted Engines</TabsTrigger>
			</TabsList>
			<TabsContent value="published" className="my-6"><PublishedEngines /></TabsContent>
			<TabsContent value="drafted" className="my-6"><DraftedEngines /></TabsContent>
		</Tabs>
	);
}

export default MyEngines;
