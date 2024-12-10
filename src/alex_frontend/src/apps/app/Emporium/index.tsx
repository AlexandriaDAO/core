import React, { useEffect, useState } from "react";
import { setTransactions } from "@/apps/Modules/shared/state/content/contentDisplaySlice";
import MainLayout from "@/layouts/MainLayout";
import {
    PageContainer,
    Title,
    Description,
    Hint,
} from "./styles";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import getMarketListing from "./thunks/getMarketListing";
import getUserIcrc7Tokens from "./thunks/getUserIcrc7Tokens";
import getUserListing from "./thunks/geUserListing";
import { flagHandlerEmporium } from "./emporiumSlice";
import ContentListEmporium from "./contentListEmporium";
import { Button } from "@/lib/components/button";

const Emporium = () => {
    const [type, setType] = useState("");
    const [activeButton, setActiveButton] = useState(""); // Track active button
    const { user } = useAppSelector((state) => state.auth);
    const emporium = useAppSelector((state) => state.emporium);
    const dispatch = useAppDispatch();

    const fetchUserNfts = () => {
        if (user) {
            dispatch(getUserIcrc7Tokens(user?.principal));
            setType("userNfts");
        }
    };
    const fetchMarketListings = () => {
        dispatch(getMarketListing());
        setType("marketPlace");
    };
    const fetchUserListings = () => {
        dispatch(getUserListing());
        setType("marketPlace");
    };

    useEffect(() => {
        if (emporium.depositNftSuccess === true) {
            dispatch(flagHandlerEmporium());
            fetchUserNfts();
        } else if (
            emporium.buyNftSuccess === true ||
            emporium.removeListingSuccess === true
        ) {
            dispatch(flagHandlerEmporium());
            fetchMarketListings();
        }
        else if (emporium.editListingSuccess === true
        ) {
            dispatch(flagHandlerEmporium());
            fetchUserListings();
            setActiveButton("userListings");

        }
    }, [emporium]);

    useEffect(() => {
        dispatch(setTransactions([]));
    }, []);

    return (
        <>
            <PageContainer>
                <Title>Emporium</Title>
                <Description>Trade.</Description>
                <Hint></Hint>
                <div className="pb-4 text-center">
                    <Button
                        className={`bg-[#353535] h-14 px-7 text-white text-xl border border-2 border-[#353535] rounded-[30px] me-5 hover:bg-white hover:text-[#353535] ${activeButton === "userNfts" ? "bg-white text-[#353535]" : ""
                            }`}
                        disabled={!user?.principal}
                        onClick={() => {
                            fetchUserNfts();
                            setActiveButton("userNfts");
                        }}
                    >
                        My Nfts
                    </Button>
                    <Button
                        className={`bg-[#353535] h-14 px-7 text-white text-xl border border-2 border-[#353535] rounded-[30px] me-5 hover:bg-white hover:text-[#353535] ${activeButton === "marketPlace" ? "bg-white text-[#353535]" : ""
                            }`}
                        onClick={() => {
                            fetchMarketListings();
                            setActiveButton("marketPlace");
                        }}
                    >
                        MarketPlace
                    </Button>
                    <Button
                        className={`bg-[#353535] h-14 px-7 text-white text-xl border border-2 border-[#353535] rounded-[30px] me-5 hover:bg-white hover:text-[#353535] ${activeButton === "userListings" ? "bg-white text-[#353535]" : ""
                            }`}
                        disabled={!user?.principal}
                        onClick={() => {
                            fetchUserListings();
                            setActiveButton("userListings");
                        }}
                    >
                        My Listing
                    </Button>
                </div>
            </PageContainer>
            <ContentListEmporium type={type} />
        </>
    );
}
export default Emporium;