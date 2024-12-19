import React, { useEffect, useState } from "react";
import { setTransactions } from "@/apps/Modules/shared/state/content/contentDisplaySlice";
import {
    PageContainer,
    Title,
    Description,
    Hint,
    ControlsContainer,
    FiltersButton,
    SearchButton,
    SearchFormContainer,
    FiltersIcon,
} from "./styles";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import getMarketListing from "./thunks/getMarketListing";
import { flagHandlerEmporium } from "./emporiumSlice";
import ContentListEmporium from "./contentListEmporium";
import { Button } from "@/lib/components/button";
import { ArrowUp } from "lucide-react";
import EmporiumSearchForm from "./component/emporiumSearchForm";
import SearchEmporium from "./component/searchEmporium";
import PaginationComponent from "./component/PaginationComponent";
import getUserIcrc7Tokens from "./thunks/getUserIcrc7Tokens";

const Emporium = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const emporium = useAppSelector((state) => state.emporium);

    const [type, setType] = useState("");
    const [activeButton, setActiveButton] = useState(""); // Track active button
    const [currentPage, setCurrentPage] = useState(1);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    const fetchUserNfts = () => {
        if (user) {
            dispatch(getUserIcrc7Tokens(user?.principal));
            setActiveButton("userNfts");
            setType("userNfts");
        }
    };
    const fetchMarketListings = () => {
        if (activeButton === "userNfts") {
            dispatch(setTransactions([]));
        }
        setActiveButton("marketPlace");
        setType("marketPlace");
    };
    const toggleFilters = () => {
        setIsFiltersOpen(!isFiltersOpen);
    };
    const fetchUserListings = () => {
        if (activeButton === "userNfts") {
            dispatch(setTransactions([]));
        }
        setActiveButton("userListings");
        setType("marketPlace");

    };
    const handleSearchClick = async () => {
        let type = emporium.search.type;
        if (!user) {
            dispatch(getMarketListing({
                page: 1,
                searchStr: emporium.search.search,
                pageSize: emporium.search.pageSize.toString(),
                sort: emporium.search.sort,
                type,
                userPrincipal: ""
            }));  // 
            setCurrentPage(0);
            return;
        }

        if (activeButton === "userListings") {
            type = "userListings";
        }
        else { //default case 
            setActiveButton("marketPlace");
            setType("marketPlace");
        }
        dispatch(getMarketListing({
            page: 1,
            searchStr: emporium.search.search,
            pageSize: emporium.search.pageSize.toString(),
            sort: emporium.search.sort,
            type,
            userPrincipal: user?.principal
        }));  // 
        setCurrentPage(0);

    };
    const handlePageClick = ({ selected }: { selected: number }) => {
        if (activeButton === "marketPlace") {
            setCurrentPage(selected);
            dispatch(getMarketListing({
                page: selected + 1,
                searchStr: emporium.search.search,
                pageSize: emporium.search.pageSize.toString(),
                sort: emporium.search.sort,
                type: emporium.search.type,
                userPrincipal: ""
            }));  // Adjust for 1-based page index
        }
        else if (activeButton === "userListings") {
            if (!user)
                return
            setCurrentPage(selected);

            dispatch(getMarketListing({
                page: selected + 1,
                searchStr: emporium.search.search,
                pageSize: emporium.search.pageSize.toString(),
                sort: emporium.search.sort,
                type: "userListings",
                userPrincipal: user?.principal
            }));
        }
    };


    // useEffect(() => {
    //     if (emporium.depositNftSuccess === true) {
    //         dispatch(flagHandlerEmporium());
    //         fetchUserNfts();
    //     } else if (
    //         emporium.buyNftSuccess === true ||
    //         emporium.removeListingSuccess === true
    //     ) {
    //         dispatch(flagHandlerEmporium());
    //         fetchMarketListings();
     
    //     }
    //     else if (emporium.editListingSuccess === true
    //     ) {
    //         dispatch(flagHandlerEmporium());
    //         fetchUserListings();
    //         setActiveButton("userListings");

    //     }
    // }, [emporium]);

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

                        }}
                    >
                        My Nfts
                    </Button>
                    <Button
                        className={`bg-[#353535] h-14 px-7 text-white text-xl border border-2 border-[#353535] rounded-[30px] me-5 hover:bg-white hover:text-[#353535] ${activeButton === "marketPlace" ? "bg-white text-[#353535]" : ""
                            }`}
                        onClick={() => {
                            fetchMarketListings();
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
                        }}
                    >
                        My Listing
                    </Button>
                </div>
                {activeButton === "userNfts" ? <></> : <>
                    <SearchEmporium />
                    <ControlsContainer $isOpen={isFiltersOpen}>
                        <FiltersButton
                            onClick={toggleFilters}
                            $isOpen={isFiltersOpen}
                        >
                            Filters
                            {isFiltersOpen ? <ArrowUp size={20} /> : <FiltersIcon />}
                        </FiltersButton>
                        <SearchButton
                            onClick={handleSearchClick}
                            disabled={emporium.loading}
                        >
                            {emporium.loading ? 'Loading...' : 'Search'}
                        </SearchButton>
                    </ControlsContainer>
                    <SearchFormContainer $isOpen={isFiltersOpen}>

                        <EmporiumSearchForm />
                    </SearchFormContainer>
                </>}

            </PageContainer>

            <ContentListEmporium type={type} />
            <PaginationComponent totalPages={emporium.totalPages} onPageChange={handlePageClick} currentPage={currentPage} />

        </>
    );
}
export default Emporium;
