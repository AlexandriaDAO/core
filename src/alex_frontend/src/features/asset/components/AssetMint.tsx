import React, { useEffect, useState } from "react";
import { Check, CloudUpload, LoaderCircle } from "lucide-react";
import { Button } from "@/lib/components/button";
import { toast } from "sonner";
import { arweaveIdToNat } from "@/utils/id_convert";
import { getNftManagerActor } from "@/features/auth/utils/authUtils";
import { Book, Video, Image, Audio } from "../types";
import useNftManager from "@/hooks/actors/useNftManager";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Principal } from "@dfinity/principal";

interface IAssetMintProps {
    asset: Book|Video|Image|Audio
};

const AssetMint: React.FC<IAssetMintProps> = ({
    asset
}: IAssetMintProps) => {
	const {actor} = useNftManager();
	const {user} = useAppSelector(state => state.auth);
	const [minted, setMinted] = useState<boolean|undefined>(undefined)

	const isMinted = async () => {
		try{
			if(!actor) throw new Error("Actor not found");
			if(!user) throw new Error("User not found");

			const tx = BigInt(arweaveIdToNat(asset.manifest));

			const result = await actor.nfts_exist([tx]);

			if ("Err" in result) throw new Error(result.Err);
			setMinted(result.Ok[0]);
		}catch(error){
			console.log('error', error);
			setMinted(false)
		}
	};

	useEffect(()=>{
		isMinted()
	},[])


	if(minted == undefined) return <Button variant="outline" disabled className="pointer-events-none">Processing... <LoaderCircle size={18} className="animate-spin" /></Button>


	if(minted) return <Button variant="outline" disabled className="pointer-events-none">Minted <Check size={18}/></Button>


	const mintNFT = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		try{
            setMinted(undefined)
			if(!actor) throw new Error("Actor not found");
			if(!user) throw new Error("User not found");
			toast.info("Minting NFT via ICRC7 Protocol");

			// const mintNumber = BigInt(arweaveIdToNat(asset.manifest));
			// const description = "Book minted by Alex";
			// const actorNftManager = await getNftManagerActor();
			// throws invalid arweave id error
            const result = await actor.coordinate_mint(asset.manifest, [Principal.fromText(user.principal)]);
            if ("Err" in result) throw new Error(result.Err);

			toast.success("Minted Successfully");
            setMinted(true)
		}catch(error){
			toast.error(`Error: ${error}`);
            setMinted(false)
		}
	};


	return <Button variant="outline" onClick={mintNFT} >Mint Now <CloudUpload size={18} /></Button>
}

export default AssetMint;
