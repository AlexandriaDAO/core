import React, { useEffect, useState } from "react";

import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { _SERVICE as _SERVICESWAP } from "../../../../../../declarations/icp_swap/icp_swap.did";
import { _SERVICE as _SERVICEICPLEDGER } from "../../../../../../declarations/icp_ledger_canister/icp_ledger_canister.did";

import { Link } from "react-router-dom";
import swapLbry from "../../thunks/swapLbry";
import { flagHandler } from "../../swapSlice";
import Auth from "@/features/auth";
import { LoaderCircle } from "lucide-react";
import { icp_fee } from "@/utils/utils";
import getLbryBalance from "../../thunks/lbryIcrc/getLbryBalance";
import SuccessModal from "../successModal";
import LoadingModal from "../loadingModal";


const SwapContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const icpLedger = useAppSelector((state) => state.icpLedger);
  const swap = useAppSelector((state) => state.swap);
  const [amount, setAmount] = useState("0");
  const [lbryRatio, setLbryRatio] = useState(0.0);
  const [tentativeLBRY, setTentativeLBRY] = useState(Number);
  const [loadingModalV, setLoadingModalV] = useState(false);
  const [successModalV, setSucessModalV] = useState(false);

  const handleSubmit = () => {
    let amountAfterFees = (Number(amount)).toFixed(4);
    dispatch(swapLbry(amountAfterFees));
    setLoadingModalV(true);
  };

  const handleMaxIcp = () => {
    const userBal = Math.max(
      0,
      Number(icpLedger.accountBalance) - 2 * icp_fee
    ).toFixed(4);
    setAmount(userBal);

    setTentativeLBRY(lbryRatio * Number(userBal));

  };
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (Number(e.target.value) >= 0) {
      setAmount(e.target.value);

      setTentativeLBRY(lbryRatio * Number(e.target.value));
    }

  };
  useEffect(() => {
    setLbryRatio(Number(swap.lbryRatio));
    setTentativeLBRY(
      parseFloat((Number(swap.lbryRatio) * Number(amount)).toFixed(4))
    );
  }, [swap.lbryRatio]);
  useEffect(() => {
    if (swap.swapSuccess === true) {
      dispatch(getLbryBalance(user));
      dispatch(flagHandler());
      setLoadingModalV(false);
      setSucessModalV(true);
    }
  }, [swap.swapSuccess]);
  useEffect(() => {
    if (swap.error) {
      setLoadingModalV(false);
    }
  }, [swap])
  return (
    <div>
      <div className="mb-5 2xl:mb-10 xl:mb-7 lg:mb-7 md:mb-6 sm:mb-5">
        <h3 className="text-tabsheading 2xl:text-xxltabsheading xl:text-xltabsheading lg:text-lgtabsheading md:text-mdtabsheading sm:text-smtabsheading font-bold">
          Swap
        </h3>
      </div>
      <div className="grid grid-cols-1 2xl:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-1">
        <div className="me-0 2xl:me-2 xl:me-2 lg:me-2 md:me-0 sm:me-0 mb-3 2xl:mb-0 xl:mb-0 lg:mb-0 md:mb-3 sm:mb-3">
          <div className="block 2xl:flex xl:flex lg:flex md:flex sm:block justify-between mb-5 w-full">
            <div className="bg-white border border-[#C5CFF9] text-white py-5 px-7 rounded-borderbox me-0 2xl:me-2 xl:me-2 lg:me-2 md:me-2 sm:me-0 w-full 2xl:w-6/12 xl:w-6/12 lg:w-6/12 md:w-6/12 sm:w-full mb-3 2xl:mb-0 xl:mb-0 lg:mb-0 md:mb-0 sm:mb-3">
              <div className="flex justify-between mb-5	">
                <h2 className="text-swapheading 2xl:text-xxlswapheading xl:text-xlswapheading lg:text-lgswapheading md:text-mdswapheading ms:text-smswapheading font-medium text-black">
                  ICP
                </h2>
                <div>
                  <input
                    className="text-black text-right text-swapheading 2xl:text-xxlswapheading xl:text-xlswapheading lg:text-lgswapheading md:text-mdswapheading ms:text-smswapheading bg-transparent  placeholder-black  focus:outline-none focus:border-transparent w-full"
                    type="number"
                    defaultValue={amount}
                    value={amount}
                    min="0"
                    onChange={(e) => {
                      handleAmountChange(e);
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-between 	">
                <strong className="text-base text-[#353535] font-medium me-1">
                  Balance:{icpLedger.accountBalance}
                </strong>

                <Link
                  role="button"
                  className="text-base font-blod text-[#A7B1D7] underline"
                  to={""}
                  onClick={() => handleMaxIcp()}
                >
                  Max
                </Link>
              </div>
            </div>
            <div className="bg-white border border-[#C5CFF9] text-white py-5 px-7 rounded-borderbox me-0 2xl:ms-2 xl:ms-2 lg:ms-2 md:ms-2 sm:me-0 w-full 2xl:w-6/12 xl:w-6/12 lg:w-6/12 md:w-6/12 sm:w-full">
              <div className="flex justify-between mb-5">
                <h2 className="text-swapheading 2xl:text-xxlswapheading xl:text-xlswapheading lg:text-lgswapheading md:text-mdswapheading ms:text-smswapheading font-medium text-black">
                  LBRY
                </h2>
                <h3 className="text-swapvalue text-right text-swapheading 2xl:text-xxlswapheading xl:text-xlswapheading lg:text-lgswapheading md:text-mdswapheading ms:text-smswapheading font-medium">
                  {tentativeLBRY.toFixed(4)}
                </h3>
              </div>
              <div className="flex justify-between">
                <strong className="text-base text-[#353535] font-medium me-1">
                  Balance: {swap.lbryBalance} LBRY
                </strong>
              </div>
            </div>
          </div>
          <div>
            {user !== '' ? (
              <button
                type="button"
                className={`w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2
      ${parseFloat(amount) === 0 || swap.loading ? 'text-[#808080] cursor-not-allowed' : 'bg-balancebox text-white cursor-pointer'}`}
                style={{
                  backgroundColor: parseFloat(amount) === 0 || swap.loading ? '#525252' : '', // when disabled
                }}
                disabled={parseFloat(amount) === 0 || swap.loading}
                onClick={handleSubmit}
              >
                {swap.loading ? (
                  <LoaderCircle size={18} className="animate-spin  mx-auto" />
                ) : (
                  <>Swap</>
                )}
              </button>
            ) : (
              <div
                className="bg-balancebox text-white w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2 flex items-center justify-center white-auth-btn"
              >
                <Auth />
              </div>
            )}
          </div>
        </div>
        <div className="border border-gray-400 text-white py-5 px-5 rounded-2xl ms-3">
          <ul className="ps-0">
            <li className="flex justify-between mb-5">
              <strong className="text-lg font-semibold me-1 text-radiocolor">
                Network Fees
              </strong>
              <span className="text-lg font-semibold text-radiocolor">
                {icp_fee} ICP
              </span>
            </li>
            <li className="flex justify-between mb-5">
              <strong className="text-lg font-semibold me-1 text-radiocolor">
                Send
              </strong>
              <span className="text-lg font-semibold text-radiocolor">
                {amount} ICP
              </span>
            </li>
            <li className="flex justify-between mb-5">
              <strong className="text-lg font-semibold me-1 text-radiocolor">
                Receive
              </strong>
              <span className="text-lg font-semibold text-radiocolor">
                {tentativeLBRY.toFixed(4)} LBRY
              </span>
            </li>
            <li className="flex justify-between mb-5">
              <strong className="text-lg font-semibold me-1 text-radiocolor">
                For each ICP you swap, you'll receive             <span className="text-[#FF9900]">{tentativeLBRY}</span> LBRY tokens.

              </strong>

            </li>
            <li>
              <strong className="text-lg font-semibold me-1 text-radiocolor">
                Please review the details carefully, as swaps are irreversible and cannot be undone once confirmed.
              </strong>
            </li>
          </ul>
        </div>
      </div>


      <LoadingModal show={loadingModalV} message1={"Swap in Progress"} message2={"Your transaction from ICP to LBRY is being processed. This may take a few moments."} setShow={setLoadingModalV} />
      <SuccessModal show={successModalV} setShow={setSucessModalV} />
    </div>
  );
};
export default SwapContent;
