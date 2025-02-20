import React from "react";
import { ArrowUpToLine, CheckCircle2, LoaderPinwheel, RotateCcw } from "lucide-react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { toast } from "sonner";
import useNftManager from "@/hooks/actors/useNftManager";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import mintNFT from "../../thunks/mintNFT";
import { Button } from "@/lib/components/button";

const MintNFT: React.FC = () => {
    const dispatch = useAppDispatch();
	const {transaction, minting, minted, mintError} = useAppSelector(state=>state.upload);

	const {actor} = useNftManager();

    const handleMint = async(e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if(minted && minted == transaction) {
            toast.success('NFT already minted');
            return;
        }

        if(!actor) {
            toast.error('Actor not available');
            return;
        }

        dispatch(mintNFT({actor}));
    }


	return (
        <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-medium">
                        NFT Mint
                    </h4>
                    <p className="text-sm text-gray-500">
                        {minting
                            ? "Please wait while we are minting your file"
                            : minted == transaction
                                ? <span className="text-sm text-gray-500">Your file has been minted. <br /> It takes a few minutes to show up in PermaSearch.</span>
                                : "Create an NFT from your uploaded file"}
                    </p>
                </div>

                {

                    minting ? <Button variant="outline" disabled={true}> <LoaderPinwheel size={18} className="animate-spin"/> Minting </Button> : 
                        minted == transaction ? <Button variant="constructive" disabled={true}> <CheckCircle2 size={18}/> Minted </Button> : 
                            mintError ? <Button variant="warning" onClick={handleMint}> <RotateCcw size={16}/> Try Again </Button> : <Button onClick={handleMint} variant="outline"> <ArrowUpToLine size={16}/> Mint NFT </Button>

                }

                {/* <button
                    onClick={handleMint}
                    disabled={minting || minted == transaction}
                    className={`
                        px-4 py-2 rounded-md text-sm font-medium transition-colors
                        ${
                            minting
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : mintError
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                        }
                    `}
                >
                    {minting ? (
                        <div className="flex items-center">
                            <Loader2
                                className="w-4 h-4 mr-2 animate-spin"
                                strokeWidth={2}
                            />
                            Minting...
                        </div>
                    ) : minted == transaction ? (
                        <div className="flex items-center">
                            <CheckCircle2
                                className="w-4 h-4 mr-2"
                                strokeWidth={2}
                            />
                            Minted
                        </div>
                    ) : (
                        mintError ? "Retry Minting" : "Mint NFT"
                    )}
                </button> */}
            </div>

            {/* Minting Error */}
            {mintError && (
                <div className="mt-2 p-2 bg-destructive/50 border rounded-md">
                    <p className="text-sm text-destructive-foreground">
                        {mintError}
                    </p>
                </div>
            )}
        </div>
    );
};

export default MintNFT;
