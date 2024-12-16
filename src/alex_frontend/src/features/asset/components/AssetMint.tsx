import React, { useEffect, useState } from "react";
import { Check, CloudUpload, LoaderCircle } from "lucide-react";
import { Button } from "@/lib/components/button";
import { toast } from "sonner";
import { arweaveIdToNat } from "@/utils/id_convert";
import { getNftManagerActor } from "@/features/auth/utils/authUtils";
import { Book, Video, Image, Audio } from "../types";

interface IAssetMintProps {
    asset: Book|Video|Image|Audio
};

const AssetMint: React.FC<IAssetMintProps> = ({
    asset
}: IAssetMintProps) => {
	const [minted, setMinted] = useState<boolean|undefined>(undefined)

	const isMinted = async () => {
		try{
			const mintNumber = BigInt(arweaveIdToNat(asset.manifest));
			const actorNftManager = await getNftManagerActor();
			const result = await actorNftManager.nfts_exist([mintNumber]);

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
			toast.info("Minting NFT via ICRC7 Protocol");

			const mintNumber = BigInt(arweaveIdToNat(asset.manifest));
			const description = "Book minted by Alex";
			const actorNftManager = await getNftManagerActor();
            const result = await actorNftManager.coordinate_mint(mintNumber);

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
