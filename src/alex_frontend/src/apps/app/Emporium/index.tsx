import React, { useEffect, useState } from "react";
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
import ContentListEmporium from "./contentListEmporium";
import { Button } from "@/lib/components/button";
import { ArrowUp } from "lucide-react";
import EmporiumSearchForm from "./component/emporiumSearchForm";
import SearchEmporium from "./component/searchEmporium";
import PaginationComponent from "./component/PaginationComponent";
import getUserIcrc7Tokens from "./thunks/getUserIcrc7Tokens";
import getSpendingBalance from "@/features/swap/thunks/lbryIcrc/getSpendingBalance";

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
        setCurrentPage(0);
        dispatch(getMarketListing({
            page: 1,
            searchStr: emporium.search.search,
            pageSize: (emporium.search.pageSize-1).toString(),
            sort: emporium.search.sort,
            type,
            userPrincipal: !user?.principal ? "" : user?.principal
        }));  
        setActiveButton("marketPlace");
        setType("marketPlace");
    }; 
    // For instant search we can use this but send multiple calls on each search charcter 
    // const fetchMarketListings = useCallback(() => {
    //     setCurrentPage(0);
    //     getListings({
    //         page: 1,
    //         searchStr: search.search,
    //         pageSize: search.pageSize.toString(),
    //         sort: search.sort,
    //         type: emporium.search.type,
    //         userPrincipal: user?.principal || ""
    //     });
    //     setActiveButton("marketPlace");
    //     setDisplayType("marketPlace");
    // }, [getListings, search, user?.principal]);
    const toggleFilters = () => {
        setIsFiltersOpen(!isFiltersOpen);
    };
    const fetchUserListings = () => {
        if (!user?.principal)
            return;
        dispatch(getMarketListing({
            page: 1,
            searchStr: emporium.search.search,
            pageSize: emporium.search.pageSize.toString(),
            sort: emporium.search.sort,
            type: "userListings",
            userPrincipal: user?.principal
        }));
        setActiveButton("userListings");
        setType("marketPlace");
        setCurrentPage(0);


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

    // intial 
    useEffect(() => {
        fetchMarketListings()
    }, []);


    useEffect(() => {
        if (user?.principal) {
            dispatch(getSpendingBalance(user.principal));
        }
    }, [dispatch, user]);

    return (
        <>
            <PageContainer className="">
                <Title className="lg:text-5xl md:text-3xl sm:text-2xl xs:text-xl">Emporium</Title>
                <Description>MarketPlace</Description>
                <Hint></Hint>
                <div className="pb-4 text-center">
                    <Button
                        className={`bg-[#353535] lg:h-14 xs:h-10 lg:px-7 xs-px-5 text-white lg:text-xl md:text-lg sm:text-base xs:text-sm border border-2 border-[#353535] rounded-[30px] lg:me-5 md:me-3 xs:me-2 hover:bg-white hover:text-[#353535] mb-2 ${activeButton === "userNfts" ? "bg-white text-[#353535]" : ""
                            }`}
                        disabled={!user?.principal}
                        onClick={() => {
                            fetchUserNfts();

                        }}
                    >
                        My Nfts
                    </Button>
                    <Button
                        className={`bg-[#353535] lg:h-14 xs:h-10 lg:px-7 xs-px-5 text-white lg:text-xl md:text-lg sm:text-base xs:text-sm border border-2 border-[#353535] rounded-[30px] lg:me-5 md:me-3 xs:me-2 hover:bg-white hover:text-[#353535] mb-2 ${activeButton === "marketPlace" ? "bg-white text-[#353535]" : ""
                            }`}
                        onClick={() => {
                            fetchMarketListings();
                        }}
                    >
                        MarketPlace
                    </Button>
                    <Button
                        className={`bg-[#353535] lg:h-14 xs:h-10  lg:px-7 xs-px-5 text-white lg:text-xl md:text-lg sm:text-base xs:text-sm border border-2 border-[#353535] rounded-[30px] lg:me-5 md:me-3 xs:me-2 hover:bg-white hover:text-[#353535] ${activeButton === "userListings" ? "bg-white text-[#353535]" : ""
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
export default React.memo(Emporium);