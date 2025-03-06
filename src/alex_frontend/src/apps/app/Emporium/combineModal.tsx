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
import "./component/style.css"



interface CombinedModalProps {
    type: "Sell" | "Edit" | "Remove" | "Buy";
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
    const contentData = useAppSelector((state) => state.transactions.contentData);
    const user = useAppSelector((state) => state.auth);
    const emporium = useAppSelector((state) => state.emporium);
    const swap = useAppSelector((state) => state.swap);
    const [price, setPrice] = useState(modalData.price || "");

    if (!modalData.show) return null;

    const handleAction = () => {
        if (Number(swap.spendingBalance) >= MARKETPLACE_LBRY_FEE) {
            switch (type) {
                case "Sell":
                    dispatch(listNft({ nftArweaveId: modalData.arwaveId, price }));
                    break;
                case "Edit":
                    dispatch(updateListing({ nftArweaveId: modalData.arwaveId, price }));
                    break;
                case "Remove":
                    dispatch(removeListedNft(modalData.arwaveId));
                    break;
                case "Buy":
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
            case "Sell":
                return (
                    <>
                        <div className="mb-4">
                            <Label htmlFor="price" className="block text-sm  font-medium  mb-4 text-foreground">
                                <strong>Price (in ICP)</strong> <span className="text-red-500">*</span>:
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                value={price + ""}
                                className={`w-full border rounded-2xl px-3 py-2 ${Number(price) === 0 ? "border" : "border-gray-300"
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
                        <Label htmlFor="price" className="block text-sm font-normal mb-4 text-foreground text=[#64748B]">
                            {MARKETPLACE_LBRY_FEE} LBRY fee will be charged from spending wallet
                        </Label>
                    </>
                );
            case "Edit":
                return (
                    <>
                        {/* <h2 className="text-3xl font-semibold mb-6 text-foreground">Edit</h2>
                        <p className="mb-4 break-all text-foreground text-sm font-medium">ID: {modalData.arwaveId}</p> */}
                        <div className="mb-4">
                            <Label className="block text-sm font-medium text-foreground mb-1"> <strong>Current Price: {modalData.price} ICP</strong></Label>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="price" className="block text-sm font-medium text-foreground mb-4">
                                <strong>NewPrice (in ICP)</strong><span className="text-red-500">*</span>:
                            </Label>

                            <Input
                                id="price"
                                type="number"
                                value={price + ""}
                                className="w-full border border-gray-300 rounded-2xl px-3 py-2"
                                placeholder="Enter new price"
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
                        <Label htmlFor="price" className="block text-sm font-normal mb-4 text-foreground text=[#64748B]">
                            {MARKETPLACE_LBRY_FEE} LBRY fee will be charged from spending wallet
                        </Label>
                    </>
                );
            case "Remove":
                return (
                    <>
                        <div className="text-center">
                            {/* <h2 className="text-3xl font-semibold mb-2 text-foreground text-2xl">Remove Item</h2>
                        <p className="mb-4 break-all text-foreground text-2xl font-medium">ID: {modalData.arwaveId}</p> */}
                            <p className="text-gray-700 lg:text-2xl md:text-lg sm:text-base xs:text-xs mb-4 dark:text-white">Are you sure you want to remove this item from marketplace?</p>
                            <Label htmlFor="price" className="block text-sm font-medium text-foreground mb-4">
                                20 LBRY fee will be charged from your spending wallet
                            </Label>
                        </div>

                    </>
                ); 19
            case "Buy":
                return (
                    <>
                        {/* <h2 className="text-3xl font-semibold mb-2 text-foreground">Buy</h2> */}

                        <p className="mb-4 lg:text-xl md:text-lg sm:text-base xs:text-xs"> <strong>Price: {emporium.marketPlace[modalData.arwaveId]?.price || "N/A"} ICP </strong> </p>
                        <p className="text-[#020617] lg:text-xl md:text-lg sm:text-base xs:text-xs font-medium mb-4 dark:text-white">Are you sure you want to buy this item </p>
                        <Label htmlFor="price" className="block text-sm font-normal mb-4 text-foreground text=[#64748B]">
                            {MARKETPLACE_LBRY_FEE} LBRY fee will be charged from spending wallet
                        </Label>
                    </>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]   ">
            <div className="bg-background bg-white rounded-xl sm:p-10 xs:p-4 lg:max-w-3xl md:max-w-2xl sm:max-w-xl xs:xs:w-11/12 w-full relative flex flex-col dark:bg-gray-900 lg:max-h-[90vh] md:max-h-[90vh] sm:max-h-[600px] xs:max-h-[550px]  overflow-y-auto">
                <div className="flex justify-between mb-4 items-baseline">
                    <h2 className="text-3xl font-semibold mb-2 text-foreground ms-2">{type}</h2>
                    <Button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white z-[1200] hover:bg-black border-0"
                    >
                        <X />
                    </Button>
                </div>
                <p className="mb-4 break-all text-foreground lg:text-medium text-sm font-medium mb-4">ID: {modalData.arwaveId}</p>

                <div className="group custom-modal relative w-full h-[300px] mb-4 rounded-lg">
                    <ContentRenderer
                        transaction={modalData.transaction}
                        content={contentData[modalData.arwaveId]}
                        contentUrls={contentData[modalData.arwaveId]?.urls || {
                            thumbnailUrl: null,
                            coverUrl: null,
                            fullUrl: contentData[modalData.arwaveId]?.url || `https://arweave.net/${modalData.arwaveId}`
                        }}
                        inModal={true}
                        handleRenderError={handleRenderError}
                    />
                </div>

                {renderModalContent()}
                <div className="flex flex-col h-full">


                    <div className="mt-4 flex justify-between mb-4 flex-shrink-0">
                        <Button
                            onClick={onClose}
                            className="bg-[#F1F5F9] lg:h-14 md:h-12 sm:h-10 xs:h-10 lg:px-7 md:px-5 sm:px-4 xs:px-2 text-[#0F172A] lg:text-lg md:text-base text-sm border border-2 border-[#F1F5F9] rounded-xl sm:me-5 xs:mb-2 hover:bg-white hover:text-[#353535] dark:bg-gray-600 dark:border-gray-600 dark:text-white hover:dark:border-gray-600 hover:dark:bg-transparent hover:dark:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAction}
                            className="bg-[#0F172A] lg:h-14 md:h-12 sm:h-10 xs:h-10 lg:px-7 md:px-5 sm:px-4 xs:px-2 text-white lg:text-lg md:text-base text-sm border border-2 border-[#353535] rounded-xl hover:bg-white hover:text-[#353535] dark:bg-[#FFFFFF] dark:border-[#FFFFFF] dark:text-[#0F1F2A] hover:dark:border-[#FFFFFF] hover:dark:text-[#FFFFFF] hover:dark:bg-transparent "
                        >
                            Confirm
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
};
export default CombinedModal;