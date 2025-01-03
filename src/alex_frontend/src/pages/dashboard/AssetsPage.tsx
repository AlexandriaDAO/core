import React, { useEffect } from "react";
import { Link } from "react-router";
import { Button } from "@/lib/components/button";
import { CloudUpload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/lib/components/tabs";
import { MyImages, MyAudios, MyVideos, MyBooks } from "@/features/asset";

// import fetchMyAssets from "@/features/asset/thunks/fetchMyAssets";
// import { useAppDispatch } from "@/store/hooks/useAppDispatch";

function AssetsPage() {
	// const dispatch = useAppDispatch();

	// useEffect(()=>{
	// 	dispatch(fetchMyAssets());
	// },[dispatch])

	return (
		<>
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">My Assets</h1>
				<div className="relative group">
					<Button 
						variant='link' 
						scale="sm" 
						className="flex justify-between gap-2 items-center opacity-50 cursor-not-allowed"
						disabled
					>
						<CloudUpload size={18}/>
						<span>Upload Content</span>
					</Button>
					<span className="absolute -bottom-8 right-0 text-xs text-gray-500 font-medium">
						Coming Soon
					</span>
				</div>
			</div>
			<div className="font-roboto-condensed bg-white rounded-lg shadow-md p-6">
				<div className="mb-6 text-gray-600 font-roboto-condensed">List of my uploaded content</div>

				<Tabs defaultValue="books" className="">
					<TabsList>
						<TabsTrigger value="images">Images</TabsTrigger>
						<TabsTrigger value="videos">Videos</TabsTrigger>
						<TabsTrigger value="audios">Audios</TabsTrigger>
						<TabsTrigger value="books">Books</TabsTrigger>
					</TabsList>
					<TabsContent value="images" className="my-6"><MyImages /></TabsContent>
					<TabsContent value="videos" className="my-6"><MyVideos /></TabsContent>
					<TabsContent value="audios" className="my-6"><MyAudios /></TabsContent>
					<TabsContent value="books" className="my-6"><MyBooks /></TabsContent>
				</Tabs>
			</div>
		</>
	);
}

export default AssetsPage;