import { getAuthClient } from "@/features/auth/utils/authUtils";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { Principal } from "azle";
import React from "react";
import { useEffect, useState } from "react";
import getUserIcrc7Tokens from "./thunks/getUserIcrc7Tokens";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import DisplayNfts from "./displayNfts";
import { fetchTransactions } from "@/apps/Modules/LibModules/arweaveSearch/api/arweaveClient";
import ContentDisplay from "@/apps/Modules/AppModules/contentGrid";
import ContentListEmporium from "./contentListEmporium";

const ListNft = () => {
    const client = getAuthClient();
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();

    // const getPrincipal = async () => {
    //     const id = (await client).getIdentity().getPrincipal();
    //     setuserPrincipal(id);
    // }
    const fetchUserNfts = () => {
        if (user)
            dispatch(getUserIcrc7Tokens(user?.principal));
    }
 
    return (<>
        List NFT
        Owner {user?.principal}
        <button onClick={() => {
            fetchUserNfts();
        }}>Fetch Nft</button>

        {/* NFT List    {emporium?.userTokens?.map((id: any) => {
            return (<td>{id}</td>)
        })} */}

        <ContentListEmporium />


    </>)
}
export default ListNft;