import React, { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import fetchMyImages from "./thunks/fetchMyImages";
import { Info, LoaderCircle, X } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/lib/components/table";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/lib/components/dialog";
import AssetMint from "./components/AssetMint";
import { setCursor, setImages } from "./assetSlice";

const MyImages = () => {
	const dispatch = useAppDispatch();
	const { images, loading, error } = useAppSelector((state)=>state.asset);

	useEffect(() => {
		dispatch(fetchMyImages());

		return () => {
			dispatch(setCursor(''));
			dispatch(setImages([]));
		}
	}, [dispatch]);

	if(loading) return (
		<div className="flex justify-start items-center gap-1">
			<span>Loading Images</span>
			<LoaderCircle size={20} className="animate animate-spin" />
		</div>
	)

	if(error) return(
		<div className="flex flex-col gap-2 justify-start items-start font-roboto-condensed text-base leading-[18px] text-black font-normal">
			<span>Error loading images</span>
			<span>{error}</span>
		</div>
	)


	if(images.length<=0) return <span>No Image Uploaded</span>


	return (
		<div className="py-10">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="text-center">Image</TableHead>
						<TableHead className="text-center">Fiction</TableHead>
						<TableHead className="text-center">Title</TableHead>
						<TableHead className="text-center">Creator</TableHead>
						<TableHead className="text-center">Language</TableHead>
						<TableHead className="text-center">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{images.map((image) => (
						<TableRow key={image.manifest}>
							<TableCell className="flex justify-center items-center">
								<div className="flex items-center justify-center">
									<LoaderCircle size={26} className="animate animate-spin"/>
								</div>
								<img
									src={`https://gateway.irys.xyz/${image.manifest}/asset`}
									alt={image.title}
									className="w-0 h-0 hidden"
									onLoad={(e) => {
										(e.currentTarget.previousElementSibling as HTMLElement).style.display = 'none';
										(e.currentTarget as HTMLImageElement).className = 'w-10 h-10 object-cover rounded block';
									}}
									onError={(e) => {
										// (e.currentTarget as HTMLImageElement).src = '/images/no-file.png';
										(e.currentTarget as HTMLElement).style.display = 'none';
										(e.currentTarget.previousElementSibling as HTMLElement).style.display = 'none';
										(e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
									}}
								/>
								<div className="hidden w-full h-full items-center justify-center">
									<Info size={26} className="text-destructive"/>
								</div>
							</TableCell>
							<TableCell className="text-center">{image.fiction ? "Yes" : "No"}</TableCell>
							<TableCell className="text-center">{image.title}</TableCell>
							<TableCell className="text-center">{image.creator}</TableCell>
							<TableCell className="text-center">{image.language}</TableCell>
							<TableCell className="text-center">
								<div className="flex justify-center items-center gap-2">
									<Dialog >
										<DialogTrigger asChild>
											<Button variant="outline">
												View Image
											</Button>
										</DialogTrigger>
										<DialogContent className="min-w-[300px] min-h-[300px] font-roboto-condensed p-0 border-none" closeIcon={null} onOpenAutoFocus={(e) => e.preventDefault()}>
											<DialogTitle className="hidden">{image.title}</DialogTitle>
											<DialogDescription className="hidden">Displaying Image</DialogDescription>
											<div className="flex items-center justify-center">
												<LoaderCircle size={26} className="animate animate-spin"/>
											</div>
											<img
												src={`https://gateway.irys.xyz/${image.manifest}/asset`}
												alt={image.title}
												className="w-0 h-0 hidden"
												onLoad={(e) => {
													(e.currentTarget.previousElementSibling as HTMLElement).style.display = 'none';
													(e.currentTarget as HTMLImageElement).className = 'w-full h-full object-cover rounded block';
												}}
												onError={(e) => {
													(e.currentTarget as HTMLImageElement).className = 'w-full h-full object-cover rounded block';
													(e.currentTarget as HTMLImageElement).src = '/images/default-cover.jpg';
													(e.currentTarget.previousElementSibling as HTMLElement).style.display = 'none';
												}}
											/>
										</DialogContent>
									</Dialog>
									<AssetMint asset={image}/>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};

export default MyImages;
