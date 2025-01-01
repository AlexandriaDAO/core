import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useState } from "react";
import listNft from "./thunks/listNft";
import updateListing from "./thunks/editListing";
import removeListedNft from "./thunks/removeListedNft";
import buyNft from "./thunks/buyNft";
import React from "react";
import { X } from 'lucide-react';
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Button } from "@/lib/components/button";
import ContentRenderer from "@/apps/Modules/AppModules/contentGrid/components/ContentRenderer";
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { MARKETPLACE_LBRY_FEE } from "./utlis";
import { toast } from "sonner";


interface CombinedModalProps {
    type: "sell" | "edit" | "remove" | "buy";
    modalData: {
        arwaveId: string;
        price: string;
        show: boolean;
        transaction: Transaction
    };
    showStats: Record<string, boolean>;
    onClose: () => void;
    handleRenderError: (transactionId: string) => void;
}

const CombinedModal: React.FC<CombinedModalProps> = ({ type, modalData, showStats, onClose, handleRenderError }) => {
    const dispatch = useAppDispatch();
    const contentData = useAppSelector((state) => state.contentDisplay.contentData);
    const mintableState = useAppSelector((state) => state.contentDisplay.mintableState);
    const emporium = useAppSelector((state) => state.emporium);
    const swap = useAppSelector((state) => state.swap);
    const [price, setPrice] = useState(modalData.price || "");

    if (!modalData.show) return null;

    const handleAction = () => {
        if (Number(swap.spendingBalance) >= MARKETPLACE_LBRY_FEE) {
            switch (type) {
                case "sell":
                    dispatch(listNft({ nftArweaveId: modalData.arwaveId, price }));
                    break;
                case "edit":
                    dispatch(updateListing({ nftArweaveId: modalData.arwaveId, price }));
                    break;
                case "remove":
                    dispatch(removeListedNft(modalData.arwaveId));
                    break;
                case "buy":
                    dispatch(buyNft({ nftArweaveId: modalData.arwaveId, price: modalData.price }));
                    break;
            }
        } else {
            toast.error(`Must have atleast ${MARKETPLACE_LBRY_FEE} LBRY in spending wallet`);

        }

        onClose();
        setPrice("");
    };

    const renderModalContent = () => {
        switch (type) {
            case "sell":
                return (
                    <>
                        <h2 className="text-3xl font-semibold mb-2">Sell</h2>
                        <p className="mb-4">ID: {modalData.arwaveId}</p>
                        <div className="mb-4">
                            <Label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                Price (in ICP)
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                value={price}
                                className={`w-full border rounded-md px-3 py-2 ${Number(price) === 0 ? "border-red-500" : "border-gray-300"
                                    }`}
                                placeholder="Enter price"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (Number(e.target.value) < 0) {
                                        return;
                                    }
                                    if (!isNaN(Number(value))) {
                                        setPrice(value);
                                    }
                                }}
                            />

                        </div>
                    </>
                );
            case "edit":
                return (
                    <>
                        <h2 className="text-3xl font-semibold mb-2">Edit</h2>
                        <p className="mb-4">ID: {modalData.arwaveId}</p>
                        <div className="mb-4">
                            <Label className="block text-sm font-medium text-gray-700 mb-1">Current Price: {modalData.price} ICP</Label>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                Updated Price (in ICP)
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                value={price}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                placeholder="Enter updated price"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (Number(e.target.value) < 0) {
                                        return;
                                    }
                                    if (!isNaN(Number(value))) {
                                        setPrice(value);
                                    }
                                }}
                            />

                        </div>
                    </>
                );
            case "remove":
                return (
                    <>
                        <h2 className="text-3xl font-semibold mb-2">Remove Item</h2>
                        <p className="mb-4">ID: {modalData.arwaveId}</p>
                        <p>Are you sure you want to remove this item from marketplace?</p>
                    </>
                );
            case "buy":
                return (
                    <>
                        <h2 className="text-3xl font-semibold mb-2">Buy</h2>
                        <p className="mb-4">Price: {emporium.marketPlace[modalData.arwaveId]?.price || "N/A"} ICP</p>
                    </>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="bg-white rounded-lg p-10 max-w-lg w-full relative">
                <Button
                    onClick={onClose}
                    className="absolute top-1 right-1 text-gray-500 hover:text-white z-[1200]"
                >
                    <X />
                </Button>

                {renderModalContent()}
                <div className="h-96 w-auto m-auto">
                    <ContentRenderer
                        transaction={modalData.transaction}
                        content={contentData[modalData.arwaveId]}
                        contentUrls={contentData[modalData.arwaveId]?.urls || {
                            thumbnailUrl: null,
                            coverUrl: null,
                            fullUrl: contentData[modalData.arwaveId]?.url || `https://arweave.net/${modalData.arwaveId}`
                        }}
                        inModal={true}
                        showStats={showStats[modalData.arwaveId]}
                        mintableState={mintableState}
                        handleRenderError={handleRenderError}
                    />
                </div>
                <div className="mt-4 flex justify-between gap-4 mb-4">
                
                    <Button
                        onClick={onClose}
                        className="bg-[#353535] h-14 px-7 text-white text-xl border border-2 border-[#353535] rounded-xl me-5 hover:bg-white hover:text-[#353535]"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAction}
                        className="bg-[#353535] h-14 px-7 text-white text-xl border border-2 border-[#353535] rounded-xl hover:bg-white hover:text-[#353535]"
                    >
                        Confirm
                    </Button>
                </div>
                {MARKETPLACE_LBRY_FEE} LBRY fee will be charged from spending wallet
            </div>
        </div>
    );
};
export default CombinedModal;