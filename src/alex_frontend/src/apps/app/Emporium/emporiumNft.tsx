import { getAuthClient } from "@/features/auth/utils/authUtils";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { Principal } from "azle";
import React from "react";
import { useEffect, useState } from "react";
import getUserIcrc7Tokens from "./thunks/getUserIcrc7Tokens";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { fetchTransactions } from "@/apps/Modules/LibModules/arweaveSearch/api/arweaveClient";
import ContentDisplay from "@/apps/Modules/AppModules/contentGrid";
import ContentListEmporium from "./contentListEmporium";
import { flagHandlerEmporium } from "./emporiumSlice";
import getMarketListings from "./thunks/getMarketListings";

const ListNft = () => {
    const client = getAuthClient();
    const { user } = useAppSelector((state) => state.auth);
    const emporium = useAppSelector((state) => state.emporium);
    const [type, setType] = useState("");
    const dispatch = useAppDispatch();


    const fetchUserNfts = () => {
        if (user) {
            dispatch(getUserIcrc7Tokens(user?.principal));
            setType("userNfts");
        }
    }
    const fetchMarketListings = () => {
        dispatch(getMarketListings());
        setType("marketPlace");
    }
    useEffect(() => {
        if (emporium.depositNftSuccess === true) {
            dispatch(flagHandlerEmporium())
            fetchUserNfts();
        }
    }, [emporium])

    return (<>
        <p className="text-center mb-4">List NFT
            Owner {user?.principal}</p>
        <div className="pb-4 text-center">
            <button className="bg-[#353535] h-14 px-7 text-white text-xl border border-2 border-[#353535] rounded-xl font-semibold me-5 hover:bg-white hover:text-[#353535]" onClick={() => {
                fetchUserNfts();
            }}>My Nfts</button>
            <button className="bg-[#353535] h-14 px-7 text-white text-xl border border-2 border-[#353535] rounded-xl font-semibold me-5 hover:bg-white hover:text-[#353535]" onClick={() => {
                fetchMarketListings();
            }}>Market Place</button>
        </div>

        <ContentListEmporium type={type} />


    </>)
}
export default ListNft;

