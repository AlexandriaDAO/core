import { Transaction } from "@/apps/Modules/shared/types/queries";
import { Button } from "@/lib/components/button";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useMemo } from "react";


interface OverlayProps {
    transaction: Transaction;
    type: string;
    buttonType: string;
    setModal: (type: "Sell" | "Edit" | "Remove" | "Buy", modal: { show: boolean; arwaveId: string; price?: string, transaction: Transaction }) => void;
}

const Overlay: React.FC<OverlayProps> = ({ transaction, buttonType, setModal, type }) => {
    const { user } = useAppSelector((state) => state.auth);
    const emporium = useAppSelector((state) => state.emporium);

    const isUserListing = useMemo(() => {
        return user?.principal === emporium.marketPlace[transaction.id]?.owner;
    }, [user, emporium.marketPlace, transaction.id]);

    const handleButtonClick = (transactionId: string, price?: string) => {
        if (buttonType === "Sell") {
            setModal(buttonType, { arwaveId: transactionId, show: true, transaction });
        } else if (buttonType === "Buy" && price) {
            setModal(buttonType, { arwaveId: transactionId, show: true, price, transaction });
        }
    };

    const renderActionButtons = () => {
        const price = emporium.marketPlace[transaction.id]?.price;

        if (isUserListing && type === "marketPlace") {
            return (
                <div className="flex items-center mt-2">
                    <Button
                        className="bg-[#B23A48] border-[#B23A48] text-white rounded-sm w-24 h-10 flex items-center justify-center z-[25] me-3 sm:mb-0 dark:bg-[#B23A48] dark:text-white dark:border-[#B23A48] hover:dark:bg-transparent hover:dark:text-[#B23A48]"
                        onClick={(e) => {
                            e.stopPropagation();
                            setModal("Remove", { arwaveId: transaction.id, show: true, transaction });
                        }}
                    >
                        Remove
                    </Button>
                    <Button
                        className="bg-[#808080] text-white border-[#808080] rounded-sm w-24 h-10 flex items-center justify-center z-[25] dark:bg-white hover:dark:bg-transparent dark:text-[#0F172A] hover:dark:text-white"
                        onClick={(e) => {
                            e.stopPropagation();
                            setModal("Edit", { arwaveId: transaction.id, show: true, price, transaction });
                        }}
                    >
                        Edit
                    </Button>
                </div>
            );
        } else {
            return (
                 <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleButtonClick(transaction.id, price);
                    }}
                    disabled={!user?.principal}
                    className={` ${buttonType === "Sell" 
                        ? "mt-2 z-[25] relative ml-2 dark:bg-[#FFFFFF] hover:dark:bg-transparent dark:border-[#FFFFFF] dark:text-[#0F172A] hover:dark:text-white" 
                        : ""} ${buttonType==="Buy"&&"mt-2 dark:bg-[#FFFFFF] dark:border-[#FFFFFF] dark:text-[#0F172A] relative z-[30] hover:bg-gray-600 hover:dark:bg-transparent hover:dark:text-white relative ml-2" }
                        right-2 bg-[#808080] text-white border-[#808080] rounded-sm w-24 h-10 flex items-center justify-center relative z-[30] ml-2`}
                >
                    {buttonType}
                </Button>

        

            );
        }
    };

    return (
        <>
            {type === "marketPlace" && emporium.marketPlace[transaction.id]?.price && (
                <div className="text-white lg:text-lg md:text-base sm:text-sm absolute lg:bottom-[64px] lg:bottom-[64px] md:bottom-[63px] bg-gray-600 lg:min-w-[100px] sm:bottom-[63px] bottom-[64px] p-2">
                    Price {emporium.marketPlace[transaction.id]?.price} ICP
                </div>
            )}
            {renderActionButtons()}
        </>
    );
};


export default Overlay;
