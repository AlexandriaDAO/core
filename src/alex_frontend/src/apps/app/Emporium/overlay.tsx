import { Transaction } from "@/apps/Modules/shared/types/queries";
import { Button } from "@/lib/components/button";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import cancelListedNft from "./thunks/cancelistedNft ";
interface OverlayProps {
    transaction: Transaction;
    type: string;
    buttonType: string;
    showBuyModal: {
        show: boolean;
        arwaveId: string;
        price: string;
    };
    showSellModal: {
        show: boolean;
        arwaveId: string;
    };
    setShowSellModal: any;
    setShowBuyModal: any;
}
const Overlay: React.FC<OverlayProps> = ({ transaction, buttonType, showSellModal, showBuyModal, setShowSellModal, setShowBuyModal, type }) => {
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const emporium = useAppSelector((state) => state.emporium);

    const [isUserListing, setIsUserListing] = useState<Boolean>(false);

    const buttontypeHandler = (transactionId: string, price: string) => {
        if (buttonType === "Sell") {
            setShowSellModal({ arwaveId: transactionId, show: true });
        }
        else if (buttonType === "Buy") {
            setShowBuyModal({ arwaveId: transactionId, show: true, price });
        }
    }
    const checkUserListing = () => {
        if (user?.principal === emporium.marketPlace[transaction.id]?.owner) {
            setIsUserListing(true);
        }
    }
    useEffect(() => {
        checkUserListing()
    }, [])
    return (<>
        {isUserListing === true ? (<>
            <button className="absolute top-2 right-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full w-15 h-15 flex items-center justify-center z-[25]"
                onClick={() => { dispatch(cancelListedNft(transaction.id)) }}>Cancel </button>

            <button className="absolute top-10 right-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full w-15 h-15 flex items-center justify-center z-[25]"
            >Update </button>
        </>
        ) : (<>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    buttontypeHandler(transaction.id, emporium.marketPlace[transaction.id]?.price)
                }}
                className="absolute top-2 right-2 bg-green-500 hover:bg-pink-600 text-white rounded-full w-10 h-10 flex items-center justify-center z-[25]"
            >
                {buttonType}

            </button>
            {type === "marketPlace" && <div className="text-white text-lg absolute bottom-0 bg-gray-600 w-full py-2">  Price {emporium.marketPlace[transaction.id]?.price} ICP</div>
            }


        </>)}

    </>)
}
export default Overlay;