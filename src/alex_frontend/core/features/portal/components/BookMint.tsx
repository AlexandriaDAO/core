import React, { useEffect, useState } from "react";
import { Book } from "../portalSlice";
import { Check, Cloud, LoaderCircle } from "lucide-react";
import { Button } from "@/lib/components/button";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { toast } from "sonner";
import { arweaveIdToNat } from "@/utils/id_convert";
import { getNftManagerActor } from "@/features/auth/utils/authUtils";

interface IBookMintProps {
    book?: Book;
};

const BookMint: React.FC<IBookMintProps> = ({
    book
}: IBookMintProps) => {
    if(!book) return <></>

	const { user } = useAppSelector((state) => state.auth);
	const [minted, setMinted] = useState<boolean|undefined>(undefined)


	const mintNFT = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		console.log(book);
		try{
            setMinted(undefined)
			toast.info("Minting NFT via ICRC7 Protocol");

			// const mintNumber = BigInt(arweaveIdToNat(book.manifest));
			// const description = "test";
			const actorNftManager = await getNftManagerActor();
            const result = await actorNftManager.coordinate_mint(book.manifest, []);

            if ("Err" in result) throw new Error(result.Err);

			toast.success("Minted Successfully");
            setMinted(true)
		}catch(error){
			toast.error(`Error: ${error}`);
            setMinted(false)
		}
	};
	const isMinted = async () => {
		try{
			const mintNumber = BigInt(arweaveIdToNat(book.manifest));
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


    return (
        <div onClick={e=>e.stopPropagation()} className="absolute top-2 right-2">
            {minted == undefined && <Button variant="link" scale="icon" rounded="full" className="pointer-events-none"><LoaderCircle size={18} className="animate-spin" /></Button> }
            {minted && <Button onClick={()=>toast.success('Book is already minted.')} variant="link" scale="icon" rounded="full" ><Check size={18}/></Button>}
            {user && minted == false && <Button onClick={mintNFT} variant="link" scale="icon" rounded="full" ><Cloud size={18} /></Button>}
        </div>
    );
}

export default BookMint;