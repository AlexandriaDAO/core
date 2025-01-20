import React, { lazy, Suspense, useEffect } from "react";
import { Link } from "react-router";
import { Button } from "@/lib/components/button";
import { CloudUpload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/lib/components/tabs";
import { MyImages } from "@/features/asset";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { resetAssets } from "@/features/asset/assetSlice";

const MyAudios = lazy(()=>import("@/features/asset/MyAudios"));
const MyVideos = lazy(()=>import("@/features/asset/MyVideos"));
const MyBooks = lazy(()=>import("@/features/asset/MyBooks"));

function AssetsPage() {
	const dispatch = useAppDispatch();
	const {loading} = useAppSelector(state => state.asset);

	useEffect(()=>{
		return () => {
			dispatch(resetAssets());
		}
	},[resetAssets, dispatch])

	return (
		<>
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">My Assets</h1>
				<Link to="upload">
					<Button 
						variant='link' 
						scale="sm" 
						className="flex justify-between gap-2 items-center"
					>
						<CloudUpload size={18}/>
						<span>Upload Content</span>
					</Button>
				</Link>
			</div>
			<div className="font-roboto-condensed bg-white rounded-lg shadow-md p-6">
				<div className="mb-6 text-gray-600 font-roboto-condensed">List of my uploaded content</div>

				<Tabs defaultValue="images" className="">
					<TabsList>
						<TabsTrigger value="images" disabled={loading}>Images</TabsTrigger>
						<TabsTrigger value="videos" disabled={loading}>Videos</TabsTrigger>
						<TabsTrigger value="audios" disabled={loading}>Audios</TabsTrigger>
						<TabsTrigger value="books" disabled={loading}>Books</TabsTrigger>
					</TabsList>
					<TabsContent value="images" className="my-6"><MyImages /></TabsContent>
					<TabsContent value="videos" className="my-6"><Suspense fallback={<span>Loading Videos...</span>}><MyVideos /></Suspense></TabsContent>
					<TabsContent value="audios" className="my-6"><Suspense fallback={<span>Loading Audios...</span>}><MyAudios /></Suspense></TabsContent>
					<TabsContent value="books" className="my-6"><Suspense fallback={<span>Loading Books...</span>}><MyBooks /></Suspense></TabsContent>
				</Tabs>
			</div>
		</>
	);
}

export default AssetsPage;