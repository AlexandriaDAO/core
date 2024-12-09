import { Transaction } from "@/apps/Modules/shared/types/queries";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useEffect, useMemo, useState } from "react";
import cancelListedNft from "./thunks/cancelistedNft ";
import updateListing from "./thunks/updateListing";

interface OverlayProps {
    transaction: Transaction;
    type: string;
    buttonType: string;

    setSellModal: (modal: { show: boolean; arwaveId: string }) => void;
    setBuyModal: (modal: { show: boolean; arwaveId: string; price: string }) => void;
    setUpdateModal: (modal: { show: boolean; arwaveId: string; price: string }) => void;

}

const Overlay: React.FC<OverlayProps> = ({
    transaction,
    buttonType,

    setSellModal,
    setBuyModal,
    setUpdateModal,
    type,
}) => {
    const { user } = useAppSelector((state) => state.auth);
    const emporium = useAppSelector((state) => state.emporium);
    const dispatch = useAppDispatch();

    const isUserListing = useMemo(() => {
        return user?.principal === emporium.marketPlace[transaction.id]?.owner;
    }, [user, emporium.marketPlace, transaction.id]);

    const handleButtonClick = (transactionId: string, price?: string) => {
        if (buttonType === "Sell") {
            setSellModal({ arwaveId: transactionId, show: true });
        } else if (buttonType === "Buy" && price) {
            setBuyModal({ arwaveId: transactionId, show: true, price });
        }
    };


    const renderActionButtons = () => {
        const price = emporium.marketPlace[transaction.id]?.price;

        if (isUserListing && type === "marketPlace") {
            return (
                <>
                    <div className="flex items-center absolute top-2 right-2">
                        <button
                            className="bg-red-700 hover:bg-pink-600 text-white rounded-full w-24 h-10 flex items-center justify-center z-[25] me-3"
                            onClick={(e) => { e.stopPropagation(); dispatch(cancelListedNft(transaction.id)) }}
                        >
                            Cancel
                        </button>
                        <button
                            className="bg-blue-500 hover:bg-pink-600 text-white rounded-full w-24 h-10 flex items-center justify-center z-[25]"
                            onClick={(e) => {
                                e.stopPropagation(); setUpdateModal({ arwaveId: transaction.id, show: true, price: price });
                            }}

                        >
                            Update
                        </button>
                    </div>
                </>
            );
        } else {
            return (
                <>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleButtonClick(transaction.id, price);
                        }}
                        className="absolute top-2 right-2 bg-green-500 hover:bg-pink-600 text-white rounded-full w-24 h-10 flex items-center justify-center z-[25]"
                    >
                        {buttonType}
                    </button>

                </>
            );
        }
    };

    return <>

        {type === "marketPlace" && (emporium.marketPlace[transaction.id]?.price) && (
            <div className="text-white text-lg absolute bottom-0 bg-gray-600 w-full py-2">
                Price {emporium.marketPlace[transaction.id]?.price} ICP
            </div>
        )}

        {renderActionButtons()}</>;
};

export default Overlay;
