import React, { useEffect, useState } from "react";
import { ActorSubclass } from "@dfinity/agent";
import { useTheme } from "@/providers/ThemeProvider";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { _SERVICE as _SERVICESWAP } from "../../../../../../declarations/icp_swap/icp_swap.did";
import { _SERVICE as _SERVICEICPLEDGER } from "../../../../../../declarations/icp_ledger_canister/icp_ledger_canister.did";

import { flagHandler } from "../../swapSlice";
import { LoaderPinwheel } from 'lucide-react';
import getArchivedBal from "../../thunks/getArchivedBal";
import redeemArchivedBalance from "../../thunks/redeemArchivedBalance";
import LoadingModal from "../loadingModal";
import SuccessModal from "../successModal";
import ErrorModal from "../errorModal";
import { Entry } from "@/layouts/parts/Header";

const RedeemContent: React.FC = () => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const swap = useAppSelector((state) => state.swap);
  const [loadingModalV, setLoadingModalV] = useState(false);
  const [successModalV, setSucessModalV] = useState(false);
  const [errorModalV, setErrorModalV] = useState({ flag: false, title: "", message: "" });

  const handleSubmit = () => {
    dispatch(redeemArchivedBalance());
    setLoadingModalV(true);
  };

  useEffect(() => {
    if(!user) return;
    dispatch(getArchivedBal(user.principal))
  }, [user]);
  useEffect(() => {
    if (swap.redeeemSuccess === true) {
      if(user) dispatch(getArchivedBal(user.principal));
      dispatch(flagHandler());
      setLoadingModalV(false);
      setSucessModalV(true);
    } else if (swap.error) {
      setLoadingModalV(false);
      setErrorModalV({ flag: true, title: swap.error.title, message: swap.error.message });
      dispatch(flagHandler());


    }

  }, [user, swap]);

  return (
    <div>
      <div className="mb-5 2xl:mb-10 xl:mb-7 lg:mb-7 md:mb-6 sm:mb-5">
        <h3 className="text-tabsheading 2xl:text-xxltabsheading xl:text-xltabsheading lg:text-lgtabsheading md:text-mdtabsheading sm:text-smtabsheading font-bold dark:text-white">
          Redeem
        </h3>
      </div>
      <div className="grid grid-cols-1 2xl:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-1">
        <div className="me-0 2xl:me-2 xl:me-2 lg:me-2 md:me-0 sm:me-0 mb-3 2xl:mb-0 xl:mb-0 lg:mb-0 md:mb-3 sm:mb-3">
          <div className="block 2xl:flex xl:flex lg:flex md:flex sm:block justify-between mb-5 w-full">
            <div className={`bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-700 text-black dark:text-white py-5 px-7 rounded-borderbox me-0 2xl:me-2 xl:me-2 lg:me-2 md:me-2 sm:me-0 w-full 2xl:w-6/12 xl:w-6/12 lg:w-6/12 md:w-6/12 sm:w-full mb-3 2xl:mb-0 xl:mb-0 lg:mb-0 md:mb-0 sm:mb-3`}>
              <div className="flex justify-between">
                <h2 className="text-swapheading lg:text-lgswapheading md:text-mdswapheading ms:text-smswapheading font-medium text-black dark:text-white">
                  Archived ICP {swap.archivedBalance}
                </h2>
                <div>
                </div>
              </div>
            </div>
          </div>
          <div>
            {user ? <button
              type="button"
              className="bg-balancebox text-white w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2 mb-6"
              onClick={() => {
                handleSubmit();
              }}
            >
              {swap.loading ? (<>
                <LoaderPinwheel className="animate-spin text-white mx-auto" />
              </>) : (
                <>Redeem</>
              )}
            </button> : <div
              className="bg-balancebox text-white w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2 flex items-center justify-center white-auth-btn mb-4"
            >
              <Entry />
            </div>}
          </div>
        </div>

      </div>
      <LoadingModal show={loadingModalV} message1={"Redeem transaction in Progress"} message2={"Redeem transaction is being processed. This may take a few moments."} setShow={setLoadingModalV} />
      <SuccessModal show={successModalV} setShow={setSucessModalV} />
      <ErrorModal show={errorModalV.flag} setShow={setErrorModalV} title={errorModalV.title} message={errorModalV.message} />

    </div>
  );
};
export default RedeemContent;
