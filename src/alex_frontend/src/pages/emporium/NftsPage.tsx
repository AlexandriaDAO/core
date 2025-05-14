import React, { useEffect } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { getCallerAssetCanister } from "@/apps/Modules/shared/state/assetManager/assetManagerThunks";
import { useAssetManager } from "@/hooks/useAssetManager";
import { useIdentity } from "@/hooks/useIdentity";
import fetch from "@/features/icp-assets/thunks/fetch";
import getMyTokens from "@/features/imporium/nfts/thunks/getMyTokens";
import NftsSkeleton from "@/layouts/skeletons/emporium/components/NftsSkeleton";
import { Alert } from "@/components/Alert";
import Nft from "@/features/nft";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { ListNft } from "@/features/imporium/nfts/components/ListNft";
import { EmporiumActor, Icrc7Actor } from "@/actors";


const NftsPage = () => {
    const dispatch = useAppDispatch();

    const { userAssetCanister } = useAppSelector((state) => state.assetManager);
    const { ids, loading, error } = useAppSelector((state) => state.imporium.nfts);
    const { identity } = useIdentity();

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

    useEffect(() => {
        dispatch(getMyTokens());
    }, []);

    return (
        <>
            <div className="flex flex-col items-center gap-3 md:gap-6 mx-auto p-5 sm:p-10 w-full max-w-md md:max-w-2xl xl:max-w-[800px]">
                <h1 className="text-foreground text-center font-syne font-bold m-0 text-xl sm:text-2xl md:text-3xl lg:text-5xl">Emporium</h1>
                <div className="flex flex-col items-center gap-1 text-foreground text-center font-syne">
                    <h2 className="m-0 font-semibold text-base sm:text-lg md:text-xl lg:text-2xl">My Nfts</h2>
                    <p className="m-0 font-normal text-sm sm:text-base md:text-lg lg:text-xl">Here you will find the list of all your minted NFTs</p>
                </div>
            </div>
            
            {loading ? (
                <NftsSkeleton />
            ) : error ? (
                <div className="max-w-2xl flex-grow container flex justify-center items-start mt-20">
                    <Alert variant="danger" title="Error" className="w-full">{error}</Alert>
                </div>
            ) : (
                <div className="p-2">
                    <div className="lg:mb-20 md:mb-16 sm:mb-10 xs:mb-6">
                        {ids.length <= 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground text-lg">You don't have any NFTs yet.</p>
                            </div>
                        ) : (<>
                            {/* <div className="columns-1 max-w-[400px] mx-auto sm:max-w-none sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                                {ids.map((id) => (
                                    <Nft key={id} id={id} action={<SellButton />}/>
                                ))}
                            </div> */}

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {ids.map((id) => (
                                    <Nft key={id} id={id} action={
                                        <EmporiumActor>
                                            <Icrc7Actor>
                                                <ListNft id={id} />
                                            </Icrc7Actor>
                                        </EmporiumActor>
                                    }/>
                                ))}
                            </div>

                            {/* <ResponsiveMasonry
                                columnsCountBreakPoints={{ 0: 1, 640: 2, 768: 3, 1024: 4 }}
                            >
                                <Masonry gutter="16px">
                                    {ids.map((id) => (
                                        <Nft key={id} id={id} action={
                                            <EmporiumActor>
                                                <Icrc7Actor>
                                                    <ListNft id={id} />
                                                </Icrc7Actor>
                                            </EmporiumActor>
                                        }/>
                                    ))}
                                </Masonry>
                            </ResponsiveMasonry> */}

                        </>)}
                    </div>
                </div>
            )}
        </>
    );
};
export default NftsPage;