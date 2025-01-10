import React, { useEffect } from "react";
import { Button } from "@/lib/components/button";
import { LoaderCircle, ShoppingBag } from "lucide-react";
import { Link } from "react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/lib/components/tabs";
import { MintedImages, MintedAudios, MintedVideos, MintedBooks } from "@/features/collection";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import fetchMyCollection from "@/features/collection/thunks/fetchMyCollection";
import useNftManager from "@/hooks/actors/useNftManager";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { resetCollection } from "@/features/collection/collectionSlice";

function CollectionContent() {
	const {actor} = useNftManager();
	const dispatch = useAppDispatch();

	const {collection, collectionLoading, collectionError, loading} = useAppSelector((state)=>state.collection);

	useEffect(()=>{
		return () => {
			console.log('reset collection');
			dispatch(resetCollection());
		}
	},[dispatch, resetCollection])

	useEffect(()=>{
		if(!actor) return;
		dispatch(fetchMyCollection({actor}));
	},[actor, dispatch])

	if(collectionLoading) return (
		<div className="flex justify-start items-center gap-1">
			<LoaderCircle size={20} className="animate animate-spin" />
			<span>Loading collection of your NFTs</span>
		</div>
	)

	if(collectionError) return(
		<div className="flex flex-col gap-2 justify-start items-start font-roboto-condensed text-base leading-[18px] text-black font-normal">
			<span>Error loading collection of your NFTs</span>
			<span>{collectionError}</span>
		</div>
	)

	if(collection.length<=0) return <span>You have no NFTs minted</span>

	return (
		<Tabs defaultValue="images" className="">
			<TabsList>
				<TabsTrigger value="images" disabled={loading}>Images</TabsTrigger>
				<TabsTrigger value="videos" disabled={loading}>Videos</TabsTrigger>
				<TabsTrigger value="audios" disabled={loading}>Audios</TabsTrigger>
				<TabsTrigger value="books" disabled={loading}>Books</TabsTrigger>
			</TabsList>
			<TabsContent value="images" className="my-6"><MintedImages /></TabsContent>
			<TabsContent value="videos" className="my-6"><MintedVideos /></TabsContent>
			<TabsContent value="audios" className="my-6"><MintedAudios /></TabsContent>
			<TabsContent value="books" className="my-6"><MintedBooks /></TabsContent>
		</Tabs>
	)
}

function CollectionPage() {
	return (
		<>
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">My Collection</h1>
				<Link to="/app/emporium/">
					<Button variant='link' scale="sm" className="flex justify-between gap-2 items-center">
						<ShoppingBag size={18}/>
						<span>Visit Shop Page</span>
					</Button>
				</Link>
			</div>
			<div className="font-roboto-condensed bg-white rounded-lg shadow-md p-6">
				<div className="mb-6 text-gray-600 font-roboto-condensed">List of my NFTs</div>
				<CollectionContent />
			</div>
		</>
	);
}

export default CollectionPage;