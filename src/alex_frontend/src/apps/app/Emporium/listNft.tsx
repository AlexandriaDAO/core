import { getAuthClient } from "@/features/auth/utils/authUtils";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { Principal } from "azle";
import React from "react";
import { useEffect, useState } from "react";
import getUserIcrc7Tokens from "./thunks/getUserIcrc7Tokens";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import DisplayNfts from "./displayNfts";

const ListNft = () => {
    const client = getAuthClient();
    const dispatch = useAppDispatch();
    const emporium = useAppSelector((state) => state.emporium);
    const [userPrincipal, setuserPrincipal] = useState<Principal>();


    const getPrincipal = async () => {
        const id = (await client).getIdentity().getPrincipal();
        setuserPrincipal(id);
    }
    const fetchUserNfts = () => {
        dispatch(getUserIcrc7Tokens(userPrincipal));
    }
    useEffect(() => {
        getPrincipal();
    }, [])
    return (<>
        List NFT
        Owner {userPrincipal?.toString()}
        <button onClick={() => {
            fetchUserNfts();
        }}>Fetch Nft</button>

        {/* NFT List    {emporium?.userTokens?.map((id: any) => {
            return (<td>{id}</td>)
        })} */}

        <DisplayNfts />


    </>)
}
export default ListNft;