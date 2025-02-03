import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import React, { useEffect, useState } from 'react';
import { createAssetCanister, fetchUserNfts, getAssetCanister, syncNfts, syncProgressInterface } from '../state/assetManager/assetManagerThunks';

const AssetManager = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth);
  const nftData = useAppSelector((state) => state.nftData)
  const assetManager = useAppSelector((state) => state.assetManager);
  const [userAssetCanister, setUserAssetCanister] = useState<string|null>(null);
  const [syncProgress, setSyncProgress] = useState<syncProgressInterface>({
    currentItem: "0",
    progress: 0,       // Default progress
    totalSynced: 0,
    currentProgress: 0,
  });
  const fetchNfts=async ()=>{
    if (!user.user?.principal ||!assetManager.userAssetCanister) return;
    dispatch(fetchUserNfts({userPrincipal:user.user?.principal,userAssetCanister:assetManager.userAssetCanister}));
  }
  const createUserAssetCanister = () => {
    if (!user.user?.principal) return;
    dispatch(createAssetCanister({ userPrincipal: user.user.principal }))
  }
  const sync = () => {
    if (!user.user?.principal ||!userAssetCanister) return;
    dispatch(syncNfts({
      userPrincipal: user.user.principal, syncProgress, setSyncProgress,
      userAssetCanister: userAssetCanister
    }))
  }
  
  useEffect(() => {
    setUserAssetCanister(assetManager.userAssetCanister);
  }, [assetManager.userAssetCanister])
  useEffect(() => {
    dispatch(getAssetCanister())
  }, [])

  return (<div className="bg-gray-100 flex flex-col items-center justify-center py-10 absolute right-[50px]">
    {/* <h1 className="text-4xl font-bold text-gray-700 mb-8">Asset Manager</h1> */}
    <button onClick={() => { fetchNfts()}}>Fetch</button>  {/*Just for testing image loading from asset canister*/ }
    {userAssetCanister ===null ? (
      <div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Create Asset Canister</h2>
        <button
          onClick={() => createUserAssetCanister()}
          disabled={assetManager.isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
        >
          Create
        </button>
      </div>
    ) : (
      <div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full text-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Asset Canister ID</h2>
        <p className="text-lg text-gray-600 mb-4">
          <span className="font-mono font-semibold text-[#525252]">{assetManager.userAssetCanister}</span>
        </p>
        <button className="bg-[#353535] text-white px-8 py-3 rounded-full hover:bg-[#454545] transition-colors" onClick={sync}>
          Sync
        </button>
      </div>
    )}
    <h1 className='text-xl'>Synced :{syncProgress.totalSynced}</h1>

    {syncProgress?.currentItem && (
      <div className="w-full max-w-md space-y-3">
        {/*  Current Item Being Processed */}
        <div className="text-sm text-gray-600">
          {syncProgress.currentProgress === 100
            ? "Upload Complete"
            : `Uploading: ${syncProgress.currentItem}`}
        </div>

        {/*  Current NFT Upload Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${syncProgress.currentProgress ?? 0}%` }}
          />
        </div>

        {/*  Total Synced Progress Bar */}
        {
          <>
            <div className="text-sm text-gray-600">
              Total Synced: {syncProgress.totalSynced ?? 0} of  {nftData.totalNfts}
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: `${((syncProgress.totalSynced ?? 0) / nftData.totalNfts) * 100
                    }%`,
                }}
              />
            </div>
          </>
        }

        { assetManager.urls.length>0&&
            <img 
            src={assetManager.urls[0]} 
            alt="Fetched image" 
            className="w-full h-auto rounded-lg shadow-lg"
          />
        }
      </div>
    )}


  </div>);
}
export default AssetManager;