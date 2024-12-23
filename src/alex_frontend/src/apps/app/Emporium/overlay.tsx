import { Transaction } from "@/apps/Modules/shared/types/queries";
import { Button } from "@/lib/components/button";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useMemo } from "react";


interface OverlayProps {
    transaction: Transaction;
    type: string;
    buttonType: string;
    setModal: (type: "sell" | "edit" | "remove" | "buy", modal: { show: boolean; arwaveId: string; price?: string, transaction: Transaction }) => void;
}

const Overlay: React.FC<OverlayProps> = ({ transaction, buttonType, setModal, type }) => {
    const { user } = useAppSelector((state) => state.auth);
    const emporium = useAppSelector((state) => state.emporium);

    const isUserListing = useMemo(() => {
        return user?.principal === emporium.marketPlace[transaction.id]?.owner;
    }, [user, emporium.marketPlace, transaction.id]);

    const handleButtonClick = (transactionId: string, price?: string) => {
        if (buttonType === "Sell") {
            setModal("sell", { arwaveId: transactionId, show: true, transaction });
        } else if (buttonType === "Buy" && price) {
            setModal("buy", { arwaveId: transactionId, show: true, price, transaction });
        }
    };

    const renderActionButtons = () => {
        const price = emporium.marketPlace[transaction.id]?.price;

        if (isUserListing && type === "marketPlace") {
            return (
                <div className="flex items-center absolute top-2 right-2">
                    <Button
                        className="bg-red-700  text-white rounded-full w-24 h-10 flex items-center justify-center z-[25] me-3"
                        onClick={(e) => {
                            e.stopPropagation();
                            setModal("remove", { arwaveId: transaction.id, show: true, transaction });
                        }}
                    >
                        Remove
                    </Button>
                    <Button
                        className="bg-blue-500 text-white rounded-full w-24 h-10 flex items-center justify-center z-[25]"
                        onClick={(e) => {
                            e.stopPropagation();
                            setModal("edit", { arwaveId: transaction.id, show: true, price, transaction });
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
                    className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-24 h-10 flex items-center justify-center z-[25]"
                >
                    {buttonType}
                </Button>

        

            );
        }
    };

    return (
        <>
            {type === "marketPlace" && emporium.marketPlace[transaction.id]?.price && (
                <div className="text-white text-lg absolute bottom-0 bg-gray-600 w-full py-2">
                    Price {emporium.marketPlace[transaction.id]?.price} ICP
                </div>
            )}
            {renderActionButtons()}
        </>
    );
};


export default Overlay;
