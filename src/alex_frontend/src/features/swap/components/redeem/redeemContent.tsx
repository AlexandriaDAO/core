import React, { useEffect, useState } from "react";
import { ActorSubclass } from "@dfinity/agent";

import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { _SERVICE as _SERVICESWAP } from "../../../../../../declarations/icp_swap/icp_swap.did";
import { _SERVICE as _SERVICEICPLEDGER } from "../../../../../../declarations/icp_ledger_canister/icp_ledger_canister.did";

import { Link } from "react-router-dom";
import swapLbry from "../../thunks/swapLbry";
import { flagHandler } from "../../swapSlice";
import { ImSpinner8 } from "react-icons/im";
import Auth from "@/features/auth";
import getArchivedBal from "../../thunks/getArchivedBal";
import redeemArchivedBalance from "../../thunks/redeemArchivedBalance";

const RedeemContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const icpLedger = useAppSelector((state) => state.icpLedger);
  const swap = useAppSelector((state) => state.swap);
  const [amount, setAmount] = useState("1");
  const fee = 0.0001;
  const handleSubmit = () => {
    //  e.preventDefault();
    dispatch(redeemArchivedBalance());
  };

  useEffect(() => {
    dispatch(getArchivedBal(user))
  }, [user]);
  useEffect(() => {
    if (swap.redeeemSuccess === true) {
      dispatch(getArchivedBal(user));
      dispatch(flagHandler());
    }
  }, [swap.redeeemSuccess]);
  return (
    <div>
      <div className="mb-5 2xl:mb-10 xl:mb-7 lg:mb-7 md:mb-6 sm:mb-5">
        <h3 className="text-tabsheading 2xl:text-xxltabsheading xl:text-xltabsheading lg:text-lgtabsheading md:text-mdtabsheading sm:text-smtabsheading font-bold">
          Redeem
        </h3>
      </div>
      <div className="grid grid-cols-1 2xl:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-1">
        <div className="me-0 2xl:me-2 xl:me-2 lg:me-2 md:me-0 sm:me-0 mb-3 2xl:mb-0 xl:mb-0 lg:mb-0 md:mb-3 sm:mb-3">
          <div className="block 2xl:flex xl:flex lg:flex md:flex sm:block justify-between mb-3 w-full">
            <div className="border border-gray-400 text-white py-5 px-7 rounded-borderbox me-0 2xl:me-2 xl:me-2 lg:me-2 md:me-2 sm:me-0 w-full 2xl:w-6/12 xl:w-6/12 lg:w-6/12 md:w-6/12 sm:w-full mb-3 2xl:mb-0 xl:mb-0 lg:mb-0 md:mb-0 sm:mb-3">
              <div className="flex justify-between mb-5	">
                <h2 className="text-swapheading 2xl:text-xxlswapheading xl:text-xlswapheading lg:text-lgswapheading md:text-mdswapheading ms:text-smswapheading font-medium text-black">
                  Archived ICP {swap.archivedBalance}
                </h2>
                <div>
                </div>
              </div>
            </div>
          </div>
          <div>
            {user !== '' ? <button
              type="button"
              className="bg-balancebox text-white w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2"
              disabled={parseFloat(amount) === 0 || swap.loading === true}
              onClick={() => {
                handleSubmit();
              }}
            >
              {swap.loading ? (<>
                <ImSpinner8 size={18} className="animate animate-spin text-white mx-auto" /> </>) : (
                <>Redeem</>
              )}
            </button> : <div
              className="bg-balancebox text-white w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2 flex items-center justify-center white-auth-btn"
            >
              <Auth />
            </div>}
          </div>
        </div>

      </div>
    </div>
  );
};
export default RedeemContent;