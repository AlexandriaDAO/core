import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import getMarketListing from "./thunks/getMarketListing";
import ContentListEmporium from "./contentListEmporium";
import { ArrowUp, Search } from "lucide-react";
import EmporiumSearchForm from "./component/emporiumSearchForm";
import SearchEmporium from "./component/searchEmporium";
import PaginationComponent from "./component/PaginationComponent";
import getUserIcrc7Tokens from "./thunks/getUserIcrc7Tokens";
import getSpendingBalance from "@/features/swap/thunks/lbryIcrc/getSpendingBalance";
import NavigationButton from "./component/navigationButtons";
import getUserLogs from "./thunks/getUserLog";
import UserEmporiumLogs from "./component/userEmporiumLogs";
import getEmporiumMarketLogs from "./thunks/getEmporiumMarketLogs";
import EmporiumMarketLogs from "./component/emporiumLogs";
import { getCallerAssetCanister } from "@/apps/Modules/shared/state/assetManager/assetManagerThunks";
import { useAssetManager } from "@/hooks/useAssetManager";
import { useInternetIdentity } from "ic-use-internet-identity";
import fetch from "@/features/icp-assets/thunks/fetch";
import { Link } from "react-router";

const Emporium = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const emporium = useAppSelector((state) => state.emporium);
    const [type, setType] = useState("");
    const [activeButton, setActiveButton] = useState(""); // Track active button
    const [currentPage, setCurrentPage] = useState(1);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    const { userAssetCanister } = useAppSelector((state) => state.assetManager);

    const { identity } = useInternetIdentity();

    const assetManager = useAssetManager({
		canisterId: userAssetCanister ?? undefined,
		identity,
	});

	useEffect(() => {
		dispatch(getCallerAssetCanister());
	}, []);

	useEffect(() => {
		if (!assetManager) return;
		dispatch(fetch({ assetManager }));
	}, [assetManager]);

    const fetchUserLogs = () => {
        if (user) {
            dispatch(
                getUserLogs({
                    page: 1,
                    searchStr: "",
                    pageSize: "10",
                })
            );
            setActiveButton("logs");
        }
    };
    const fetchMarketLogs = () => {

        dispatch(
            getEmporiumMarketLogs({
                page: 1,
                searchStr: "",
                pageSize: "10",
            })
        );
        setActiveButton("marketLogs");
    };
    const fetchUserNfts = () => {
        if (user) {
            dispatch(getUserIcrc7Tokens(user?.principal));
            setActiveButton("userNfts");
            setType("userNfts");
        }
    };
    const fetchMarketListings = () => {
        setCurrentPage(0);
        dispatch(
            getMarketListing({
                page: 1,
                searchStr: emporium.search.search,
                pageSize: (emporium.search.pageSize ).toString(),
                sort: emporium.search.sort,
                type,
                userPrincipal: !user?.principal ? "" : user?.principal,
            })
        );
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
        if (!user?.principal) return;
        dispatch(
            getMarketListing({
                page: 1,
                searchStr: emporium.search.search,
                pageSize: emporium.search.pageSize.toString(),
                sort: emporium.search.sort,
                type: "userListings",
                userPrincipal: user?.principal,
            })
        );
        setActiveButton("userListings");
        setType("marketPlace");
        setCurrentPage(0);
    };
    const handleSearchClick = async () => {
        let type = emporium.search.type;
        if (!user) {
            dispatch(
                getMarketListing({
                    page: 1,
                    searchStr: emporium.search.search,
                    pageSize: emporium.search.pageSize.toString(),
                    sort: emporium.search.sort,
                    type,
                    userPrincipal: "",
                })
            ); //
            setCurrentPage(0);
            return;
        }

        if (activeButton === "userListings") {
            type = "userListings";
        } else {
            //default case
            setActiveButton("marketPlace");
            setType("marketPlace");
        }
        dispatch(
            getMarketListing({
                page: 1,
                searchStr: emporium.search.search,
                pageSize: emporium.search.pageSize.toString(),
                sort: emporium.search.sort,
                type,
                userPrincipal: user?.principal,
            })
        ); //
        setCurrentPage(0);
    };

    const handlePageClick = ({ selected }: { selected: number }) => {
        if (activeButton === "marketPlace") {
            setCurrentPage(selected);
            dispatch(
                getMarketListing({
                    page: selected + 1,
                    searchStr: emporium.search.search,
                    pageSize: emporium.search.pageSize.toString(),
                    sort: emporium.search.sort,
                    type: emporium.search.type,
                    userPrincipal: "",
                })
            ); // Adjust for 1-based page index
        } else if (activeButton === "userListings") {
            if (!user) return;
            setCurrentPage(selected);

            dispatch(
                getMarketListing({
                    page: selected + 1,
                    searchStr: emporium.search.search,
                    pageSize: emporium.search.pageSize.toString(),
                    sort: emporium.search.sort,
                    type: "userListings",
                    userPrincipal: user?.principal,
                })
            );
        }
    };

    // intial
    useEffect(() => {
        fetchMarketListings();
    }, []);

    useEffect(() => {
        if (user?.principal) {
            dispatch(getSpendingBalance(user.principal));
        }
    }, [dispatch, user]);
    const navigationItems = [
        {
            label: "My Nfts",
            id: "userNfts",
            onClick: fetchUserNfts,
            disabled: !user?.principal,
        },
        {
            label: "My Logs",
            id: "logs",
            onClick: fetchUserLogs,
            disabled: !user?.principal,
        },
        {
            label: "MarketPlace",
            id: "marketPlace",
            onClick: fetchMarketListings,
            disabled: false,
        },
        {
            label: "My Listing",
            id: "userListings",
            onClick: fetchUserListings,
            disabled: !user?.principal,
        },
        {
            label: "Market Logs",
            id: "marketLogs",
            onClick: fetchMarketLogs,
            disabled: false//!user?.principal,
        },

    ];

    return (
        <>
            <div className="flex flex-col items-center gap-3.5 md:gap-6 mx-auto py-10 sm:pb-4 px-5 w-full max-w-md md:max-w-2xl xl:max-w-[800px]">
                <h1 className="text-foreground text-center font-syne font-bold m-0 text-xl sm:text-2xl md:text-3xl lg:text-5xl">
                    Emporium
                </h1>
                <p className="text-foreground text-center font-syne font-normal m-0 text-2xl">MarketPlace</p>

                {activeButton !== "userNfts" && (
                    <>
                        <SearchEmporium />
                        <div className={`flex w-full gap-4 flex-wrap justify-center ${isFiltersOpen ? "mb-6" : "mb-2.5 sm:mb-0"}`}>
                            <button onClick={toggleFilters} className={`h-10 py-2.5 px-6 flex justify-center items-center gap-2.5 flex-shrink-0 rounded-[10px] cursor-pointer transition-all duration-300 ease-in-out font-syne text-base min-w-[90px] md:min-w-[100px] md:h-[50px] xl:min-w-[120px] ${isFiltersOpen ? "bg-balancebox text-white border-none shadow-sm" : "bg-background text-foreground border border-border"}`}>
                                Filters
                                {isFiltersOpen ? <ArrowUp size={20} /> : <Search size={20} />}
                            </button>
                            <button
                                onClick={handleSearchClick}
                                disabled={emporium.loading}
                                className="h-10 py-2.5 px-4 flex justify-center items-center gap-2.5 flex-grow flex-shrink-0 flex-basis-0 rounded-[10px] bg-balancebox border-none text-white cursor-pointer font-syne text-base min-w-[230px] md:min-w-[400px] md:h-[50px] xl:min-w-[600px]"
                            >
                                {emporium.loading ? "Loading..." : "Search"}
                            </button>
                        </div>
                        <div className={`${isFiltersOpen ? "h-auto py-4 px-0" : "h-0 p-0"} overflow-hidden transition-all duration-300 ease-in-out m-0 w-full max-w-[800px]`}>
                            <EmporiumSearchForm />
                        </div>
                    </>
                )}
            </div>
            <div className="container px-2">
                <div className="lg:pb-10 md:pb-8 sm:pb-6 xs:pb-4">
                    {navigationItems.map((item) => (
                        <NavigationButton
                            key={item.id}
                            label={item.label}
                            isActive={activeButton === item.id}
                            onClick={item.onClick}
                            disabled={item.disabled}
                        />
                    ))}
                </div>
                {activeButton === "logs" ? (
                    <UserEmporiumLogs />

                ) : (activeButton === "marketLogs" ? (<EmporiumMarketLogs/>) : (<>

                    <div className="lg:mb-20 md:mb-16 sm:mb-10 xs:mb-6">
                        <ContentListEmporium type={type} />
                    </div>
                    <PaginationComponent
                        totalPages={emporium.totalPages}
                        onPageChange={handlePageClick}
                        currentPage={currentPage}
                    />
                </>)



                )}
            </div>
        </>
    );
};
export default React.memo(Emporium);
