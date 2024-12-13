import React, { useEffect, useRef, useState } from "react";
import { setTransactions } from "@/apps/Modules/shared/state/content/contentDisplaySlice";
import {
    PageContainer,
    Title,
    Description,
    Hint,
    Paginate,
    ControlsContainer,
    FiltersButton,
    SearchButton,
    SearchFormContainer,
    FiltersIcon,
} from "./styles";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import getMarketListing from "./thunks/getMarketListing";
import getUserIcrc7Tokens from "./thunks/getUserIcrc7Tokens";
import getUserListing from "./thunks/geUserListing";
import { flagHandlerEmporium } from "./emporiumSlice";
import ContentListEmporium from "./contentListEmporium";
import { Button } from "@/lib/components/button";
import ReactPaginate from 'react-paginate';
import PaginationComponent from "./component/PaginationComponent";
import SearchForm from "@/apps/Modules/AppModules/search/SearchForm";
import { useHandleSearch } from "@/apps/Modules/AppModules/search/hooks/useSearchHandlers";
import { wipe } from "@/apps/Modules/shared/state/wiper";
import { ArrowUp } from "lucide-react";
import EmporiumSearchForm from "./component/emporiumSearchForm";
import SearchEmporium from "./component/searchEmporium";

const Emporium = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const emporium = useAppSelector((state) => state.emporium);

    const [type, setType] = useState("");
    const [activeButton, setActiveButton] = useState(""); // Track active button
    const [currentPage, setCurrentPage] = useState(1);

    const fetchUserNfts = () => {
        if (user) {
            dispatch(getUserIcrc7Tokens(user?.principal));
            setType("userNfts");
        }
    };
    const fetchMarketListings = () => {
        setType("marketPlace");
        dispatch(getMarketListing(1));
        setCurrentPage(0);
    };
    const fetchUserListings = () => {
        dispatch(getUserListing(1));
        setType("marketPlace");
        setCurrentPage(0);
    };
    const handlePageClick = ({ selected }: { selected: number }) => {
        if (activeButton === "marketPlace") {
            setCurrentPage(selected);
            dispatch(getMarketListing(selected + 1)); // Adjust for 1-based page index
        }
        else if (activeButton === "userListings") {
            setCurrentPage(selected);
            dispatch(getUserListing(selected + 1));
        }
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


    //
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    const handleSearchClick = async () => {
    };

    const toggleFilters = () => {
        setIsFiltersOpen(!isFiltersOpen);
    };


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

            </PageContainer>

            <ContentListEmporium type={type} />
            <PaginationComponent totalPages={emporium.totalPages} onPageChange={handlePageClick} currentPage={currentPage} />

        </>
    );
}
export default Emporium;
