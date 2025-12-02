import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { lazy, Suspense } from "react";

import { LoaderCircle } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/lib/components/tabs";
import PublishedEngines from "./components/PublishedEngines";

const DraftedEngines = lazy(() =>import("./components/DraftedEngines"));

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
			<TabsContent value="drafted" className="my-6">
				<Suspense fallback={<span>Loading Drafted Engines...</span>}>
					<DraftedEngines />
				</Suspense>
			</TabsContent>
		</Tabs>
	);
}

export default MyEngines;
