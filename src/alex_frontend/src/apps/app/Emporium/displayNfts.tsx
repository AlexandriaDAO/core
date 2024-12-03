import React, { useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import {  AppDispatch } from "@/store";

import { useAppSelector } from "@/store/hooks/useAppSelector";
import { natToArweaveId } from "@/utils/id_convert";

// Create a typed dispatch hook
const useAppDispatch = () => useDispatch<AppDispatch>();

const DiplayNfts = () => {
  const dispatch = useAppDispatch();
  const emporium = useAppSelector((state) => state.emporium);

  useEffect(() => {
  if(emporium?.userTokens.length>2){
    const tokenIdBigInt = BigInt(emporium?.userTokens[3]?.tokenId); // Convert to bigint
    console.log("fff0", natToArweaveId(tokenIdBigInt));
  }
     
    
  }, [emporium.userTokens]);
    return (
    <React.Fragment>

      <div className="grid grid-cols-4 gap-4">
        {emporium?.userTokens.map((token) => {
          return (
            <div
              key={token.tokenId}
              className="aspect-square border border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-800 bg-gray-900"
            >
              <img
                src={`https://arweave.net/${token.arweaveId}`}
                alt={token.tokenId}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          );
        })}
      </div>


      {/* <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">

        <LoaderPinwheel className="animate-spin text-4xl text-gray-500" />

      </div> */}


    </React.Fragment>
  );
};

export default React.memo(DiplayNfts);