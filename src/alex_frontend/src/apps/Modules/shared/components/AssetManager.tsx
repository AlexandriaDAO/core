import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import React, { useEffect, useState } from 'react';
import { createAssetCanister, getAssetCanister } from '../state/assetManager/assetManagerThunks';

const AssetManager = () => {
    const dispatch = useAppDispatch();
    const user= useAppSelector((state)=>state.auth);
    const assetManager = useAppSelector((state) => state.assetManager);
    const [userAssetCanister, setUserAssetCanister] = useState("");

    const createUserAssetCanister = () => {
      if(!user.user?.principal) return;
        dispatch(createAssetCanister({userPrincipal:user.user.principal}))
    }
    useEffect(() => {
        setUserAssetCanister(assetManager.userAssetCanister);
    }, [assetManager.userAssetCanister])
    useEffect(() => {

        dispatch(getAssetCanister())
    }, [])

    return (  <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">Asset Manager</h1>
  
        {userAssetCanister === "" ? (
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
          <div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Asset Canister ID</h2>
            <p className="text-lg text-gray-600 mb-4">
              <span className="font-mono font-semibold text-blue-500">{assetManager.userAssetCanister}</span>
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"> 
                Sync
            </button>
          </div>
        )}
      </div>);
}
export default AssetManager;