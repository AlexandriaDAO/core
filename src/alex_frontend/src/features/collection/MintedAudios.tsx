import React, { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import fetchMyAudios from "./thunks/fetchMyAudios";
import { Info, LoaderCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/lib/components/table";
import { setCursor, setAudios } from "./collectionSlice";
import useNftManager from "@/hooks/actors/useNftManager";

const MintedAudios = () => {
	const {actor} = useNftManager();

	const dispatch = useAppDispatch();
	const { collection, audios, loading, error } = useAppSelector((state)=>state.collection);
	const { user } = useAppSelector((state) => state.auth);

	useEffect(() => {
		return () => {
			dispatch(setCursor(''));
			dispatch(setAudios([]));
		}
	}, [setCursor, setAudios, dispatch]);

	useEffect(() => {
		if(!user || !actor || collection.length<=0) return;

		dispatch(fetchMyAudios({actor}));
	}, [user, actor, collection, fetchMyAudios, dispatch]);


	if(loading) return (
		<div className="flex justify-start items-center gap-1">
			<span>Loading Audios</span>
			<LoaderCircle size={20} className="animate animate-spin" />
		</div>
	)

	if(error) return(
		<div className="flex flex-col gap-2 justify-start items-start font-roboto-condensed text-base leading-[18px] text-black font-normal">
			<span>Error loading audios</span>
			<span>{error}</span>
		</div>
	)

	if(audios.length<=0) return <span>No Audio Minted</span>

	return (
		<div className="py-10">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="text-center">Cover</TableHead>
						<TableHead className="text-center">Title</TableHead>
						<TableHead className="text-center">Creator</TableHead>
						<TableHead className="text-center"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{audios.map((audio) => (
						<TableRow key={audio.manifest}>
							<TableCell className="text-center">
								<div className="flex items-center justify-center">
									<LoaderCircle size={26} className="animate animate-spin"/>
								</div>
								<img
									src={`https://gateway.irys.xyz/${audio.manifest}/cover`}
									alt={audio.title}
									className="w-0 h-0 hidden"
									onLoad={(e) => {
										(e.currentTarget.previousElementSibling as HTMLElement).style.display = 'none';
										(e.currentTarget as HTMLImageElement).className = 'w-full h-10 object-scale-down rounded flex justify-center items-center';
									}}
									onError={(e) => {
										(e.currentTarget as HTMLElement).style.display = 'none';
										(e.currentTarget.previousElementSibling as HTMLElement).style.display = 'none';
										(e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
									}}
								/>
								<div className="hidden w-80 h-80 items-center justify-center">
									<Info size={26} className="text-destructive"/>
								</div>
							</TableCell>
							<TableCell className="text-center">{audio.title}</TableCell>
							<TableCell className="text-center">{audio.creator}</TableCell>
							<TableCell className="text-center min-w-80">
								<audio
									controls
									className="h-10 w-full"
									src={`https://gateway.irys.xyz/${audio.manifest}/asset`}
								/>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};

export default MintedAudios;
