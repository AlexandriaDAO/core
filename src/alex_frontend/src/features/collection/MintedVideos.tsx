import React, { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import fetchMyVideos from "./thunks/fetchMyVideos";
import { Info, LoaderCircle } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/lib/components/table";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/lib/components/dialog";
// import AssetMint from "./components/AssetMint";
import { setCursor, setVideos } from "./collectionSlice";
import useNftManager from "@/hooks/actors/useNftManager";

const MintedVideos = () => {
	const {actor} = useNftManager();

	const dispatch = useAppDispatch();
	const { videos, loading, error } = useAppSelector((state)=>state.collection);
	const { user } = useAppSelector((state) => state.auth);

	useEffect(() => {
		if(!actor || !user) return;
		dispatch(fetchMyVideos({actor}));

		return () => {
			dispatch(setCursor(''));
			dispatch(setVideos([]));
		}
	}, [user, dispatch]);

	if(loading) return (
		<div className="flex justify-start items-center gap-1">
			<span>Loading Videos</span>
			<LoaderCircle size={20} className="animate animate-spin" />
		</div>
	)

	if(error) return(
		<div className="flex flex-col gap-2 justify-start items-start font-roboto-condensed text-base leading-[18px] text-black font-normal">
			<span>Error loading videos</span>
			<span>{error}</span>
		</div>
	)

	if(videos.length<=0) return <span>No Video Minted</span>

	return (
		<div className="py-10">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="text-center">Cover</TableHead>
						<TableHead className="text-center">Fiction</TableHead>
						<TableHead className="text-center">Title</TableHead>
						<TableHead className="text-center">Creator</TableHead>
						<TableHead className="text-center">Language</TableHead>
						<TableHead className="text-center">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{videos.map((video) => (
						<TableRow key={video.manifest}>
							<TableCell className="flex justify-center items-center">
								<div className="flex items-center justify-center">
									<LoaderCircle size={26} className="animate animate-spin"/>
								</div>
								<img
									src={`https://gateway.irys.xyz/${video.manifest}/cover`}
									alt={video.title}
									className="w-0 h-0 hidden"
									onLoad={(e) => {
										(e.currentTarget.previousElementSibling as HTMLElement).style.display = 'none';
										(e.currentTarget as HTMLImageElement).className = 'w-10 h-10 object-cover rounded block';
									}}
									onError={(e) => {
										// (e.currentTarget as HTMLVideoElement).src = '/images/no-file.png';
										(e.currentTarget as HTMLElement).style.display = 'none';
										(e.currentTarget.previousElementSibling as HTMLElement).style.display = 'none';
										(e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
									}}
								/>
								<div className="hidden w-80 h-80 items-center justify-center">
									<Info size={26} className="text-destructive"/>
								</div>
							</TableCell>
							<TableCell className="text-center">{video.fiction ? "Yes" : "No"}</TableCell>
							<TableCell className="text-center">{video.title}</TableCell>
							<TableCell className="text-center">{video.creator}</TableCell>
							<TableCell className="text-center">{video.language}</TableCell>
							<TableCell className="text-center">
								<div className="flex justify-center items-center gap-2">
									<Dialog >
										<DialogTrigger asChild>
											<Button variant="outline">
												View Video
											</Button>
										</DialogTrigger>
										<DialogContent className=" font-roboto-condensed p-0 border-none" closeIcon={null} onOpenAutoFocus={(e) => e.preventDefault()}>
											<DialogTitle className="hidden">{video.title}</DialogTitle>
											<DialogDescription className="hidden">Displaying Video</DialogDescription>

											<div className="h-80 flex items-center justify-center">
												<LoaderCircle size={26} className="animate animate-spin"/>
											</div>
											<video
												src={`https://gateway.irys.xyz/${video.manifest}/asset`}
												controls
												className="w-0 h-0 hidden"
												onLoadedData={(e) => {
													(e.currentTarget.previousElementSibling as HTMLElement).style.display = 'none';
													(e.currentTarget as HTMLVideoElement).className = 'w-full h-full object-contain rounded block';
												}}
												onError={(e) => {
													(e.currentTarget.previousElementSibling as HTMLElement).style.display = 'none';
													(e.currentTarget.nextElementSibling as HTMLImageElement).className = 'h-80 flex flex-col items-center justify-center gap-2';
												}}
											/>
											<div className="hidden w-0 h-0">
												<Info size={26} className="text-destructive"/>
												<span>Video could not be loaded. Try again Later!!</span>
											</div>
										</DialogContent>
									</Dialog>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};

export default MintedVideos;
