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
import ContentRenderer from "@/apps/Modules/AppModules/safeRender/ContentRenderer";
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
    onClose: () => void;
    handleRenderError: (transactionId: string) => void;
}

const CombinedModal: React.FC<CombinedModalProps> = ({ type, modalData, onClose, handleRenderError }) => {
    const dispatch = useAppDispatch();
    const contentData = useAppSelector((state) => state.contentDisplay.contentData);
    const user = useAppSelector((state) => state.auth);
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
                    if (!user.user?.principal) return;
                    dispatch(buyNft({
                        nftArweaveId: modalData.arwaveId, price: modalData.price,
                        userPrincipal: user.user?.principal
                    }));
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
                        <h2 className="text-3xl font-semibold mb-2 text-foreground">Sell</h2>
                        <p className="mb-4 break-all text-foreground text-2xl font-medium">ID: {modalData.arwaveId}</p>
                        <div className="mb-4">
                            <Label htmlFor="price" className="block text-sm font-medium  mb-1 text-foreground">
                                Price (in ICP)
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                value={price + ""}
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
                        <h2 className="text-3xl font-semibold mb-2 text-foreground">Edit</h2>
                        <p className="mb-4 break-all text-foreground text-2xl font-medium">ID: {modalData.arwaveId}</p>
                        <div className="mb-4">
                            <Label className="block text-sm font-medium text-foreground mb-1">Current Price: {modalData.price} ICP</Label>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="price" className="block text-sm font-medium text-foreground mb-1">
                                Updated Price (in ICP)
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                value={price + ""}
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
                        <h2 className="text-3xl font-semibold mb-2 text-foreground text-2xl">Remove Item</h2>
                        <p className="mb-4 break-all text-foreground text-2xl font-medium">ID: {modalData.arwaveId}</p>
                        <p className="text-gray-700">Are you sure you want to remove this item from marketplace?</p>
                    </> 
                );19
            case "buy":
                return (
                    <>
                        <h2 className="text-3xl font-semibold mb-2 text-foreground">Buy</h2>
                        <p className="mb-4">Price: {emporium.marketPlace[modalData.arwaveId]?.price || "N/A"} ICP</p>
                    </>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]   ">
            <div className="bg-background rounded-xl sm:p-10 xs:p-4 max-w-lg w-full sm:w-full xs:w-11/12 relative flex flex-col max-h-[90vh] dark:bg-gray-900">
                <Button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white z-[1200] bg-white hover:bg-black"
                >
                    <X />
                </Button>

                <div className="flex flex-col h-full">
                    {renderModalContent()}
                    <div className="group relative w-full overflow-hidden h-[300px]"> 
                        {/* {/flex-shrink-0 overflow-hidden h-[300px] w-full mx-w-full relative">} */}
                        <ContentRenderer
                            transaction={modalData.transaction}
                            content={contentData[modalData.arwaveId]}
                            contentUrls={contentData[modalData.arwaveId]?.urls || {
                                thumbnailUrl: null,
                                coverUrl: null,
                                fullUrl: contentData[modalData.arwaveId]?.url || `https://arweave.net/${modalData.arwaveId}`
                            }}
                            inModal={false}
                            handleRenderError={handleRenderError}
                        />
                    </div>
                    <div className="mt-4 flex justify-between mb-4 flex-shrink-0">
                        <Button
                            onClick={onClose}
                            className="bg-gray-600 h-14 px-7 text-white text-xl border border-2 border-gray-600 rounded-xl sm:me-5 xs:mb-2 hover:bg-white hover:text-[#353535] dark:bg-gray-600 dark:border-gray-600 dark:text-white hover:dark:border-gray-600"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAction}
                            className="bg-gray-900 h-14 px-7 text-white text-xl border border-2 border-[#353535] rounded-xl hover:bg-white hover:text-[#353535] dark:bg-[#E8D930] dark:border-[#E8D930] dark:text-[#0F1F2A] hover:dark:border-[#E8D930] "
                        >
                            Confirm
                        </Button>
                    </div>
                    <div className="text-center text-sm text-foreground flex-shrink-0">
                        {MARKETPLACE_LBRY_FEE} LBRY fee will be charged from spending wallet
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CombinedModal;