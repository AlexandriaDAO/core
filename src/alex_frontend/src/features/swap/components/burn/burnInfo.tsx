import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightLong } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux/dist/react-redux";
interface BurnInfoProps {
  maxBurnAllowed: Number;
}
const BurnInfo: React.FC<BurnInfoProps> = ({ maxBurnAllowed }) => {
  const swap = useAppSelector((state) => state.swap);
  const tokenomics = useAppSelector((state) => state.tokenomics);

  return (<>

    <div className='ms-0 2xl:ms-3 xl:ms-3 lg:ms-3 md:ms-3 sm:ms-0'>
      <div className='border border-gray-400 text-white py-5 px-5 rounded-2xl'>
        <ul className='ps-0'>
          <li className='flex justify-between mb-5'>
            <strong className='lg:text-lg md:text-base sm:text-sm font-medium me-1 text-black'>Max LBRY Burn allowed:</strong>
            <span className='lg:text-lg md:text-base sm:text-sm font-medium text-black'>{maxBurnAllowed.toFixed(4)} LBRY</span>
          </li>
          <li className='flex justify-between mb-5'>
            <strong className='lg:text-lg md:text-base sm:text-sm font-medium  me-1 text-black'>{Number(swap.lbryRatio).toFixed(4)} LBRY
              <span className='mx-2'><FontAwesomeIcon icon={faArrowRightLong} /></span>0.5 ICP/
            </strong>
          </li>
          <li className='flex justify-between mb-5'>
            <strong className='lg:text-lg md:text-base sm:text-sm font-medium me-1 text-black'>1 LBRY
              <span className='mx-2'><FontAwesomeIcon icon={faArrowRightLong} /></span>{tokenomics.alexMintRate} ALEX
            </strong>
          </li>
          <li className='flex justify-between'>
            <strong className='lg:text-lg md:text-base sm:text-sm font-medium me-1 text-black'>Network Fees</strong>
            <span className='lg:text-lg md:text-base sm:text-sm font-medium text-black'><span className=' text-multycolor'>{swap.lbryFee}</span> LBRY</span>
          </li>
        </ul>
      </div>
    </div>

  </>)

};
export default BurnInfo;
