import React, { useEffect, useState } from "react";

import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { _SERVICE as _SERVICESWAP } from "../../../../../../declarations/icp_swap/icp_swap.did";
import { _SERVICE as _SERVICEICPLEDGER } from "../../../../../../declarations/icp_ledger_canister/icp_ledger_canister.did";

import { Link } from "react-router";
import swapLbry from "../../thunks/swapLbry";
import { flagHandler } from "../../swapSlice";
import { LoaderCircle } from "lucide-react";
import { icp_fee, minimum_icp } from "@/utils/utils";
import getLbryBalance from "../../thunks/lbryIcrc/getLbryBalance";
import SuccessModal from "../successModal";
import LoadingModal from "../loadingModal";
import ErrorModal from "../errorModal";
import { Entry } from "@/layouts/parts/Header";

const SwapContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const icpLedger = useAppSelector((state) => state.icpLedger);
  const swap = useAppSelector((state) => state.swap);
  const [amount, setAmount] = useState("");
  const [lbryRatio, setLbryRatio] = useState(0.0);
  const [tentativeLBRY, setTentativeLBRY] = useState(Number);
  const [loadingModalV, setLoadingModalV] = useState(false);
  const [successModalV, setSucessModalV] = useState(false);
  const [errorModalV, setErrorModalV] = useState({ flag: false, title: "", message: "" });

  const [shadow, setShadow] = useState('shadow-[0px_0px_13px_4px_#abbddb8a] border-[#C5CFF9] ');

  const handleSubmit = () => {
    if (!user?.principal) return;
    let amountAfterFees = (Number(amount)).toFixed(4);
    dispatch(swapLbry({ amount: amountAfterFees, userPrincipal: user?.principal }));
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
      setShadow("border-[#bdbec4]");
    }
  };
  useEffect(() => {
    setLbryRatio(Number(swap.lbryRatio));
    setTentativeLBRY(
      parseFloat((Number(swap.lbryRatio) * Number(amount)).toFixed(4))
    );
  }, [swap.lbryRatio]);
  useEffect(() => {
    if (!user) return;
    if (swap.swapSuccess === true) {
      dispatch(getLbryBalance(user.principal));
      dispatch(flagHandler());
      setLoadingModalV(false);
      setSucessModalV(true);
      setAmount("");
      setTentativeLBRY(0);
    }
  }, [user, swap.swapSuccess]);
  useEffect(() => {
    if (swap.error) {
      setLoadingModalV(false);
      setErrorModalV({ flag: true, title: swap.error.title, message: swap.error.message });
      dispatch(flagHandler());

    }
  }, [swap])
  useEffect(() => {
    if (amount == "0") {
      setShadow('shadow-[0px_0px_13px_4px_#FF37371A] border-[#FF37374D]');
    }
    else if (amount == "") {
      setShadow('shadow-[0px_0px_13px_4px_#abbddb8a] border-[#C5CFF9]')

    }
    else if (Number(amount) < minimum_icp) {
      setShadow('shadow-[0px_0px_13px_4px_#FF37371A] border-[#FF37374D]');

    }
  }, [amount])
  return (
    <div>
      <div className="mb-5 2xl:mb-10 xl:mb-7 lg:mb-7 md:mb-6 sm:mb-5">
        <h3 className="text-tabsheading 2xl:text-xxltabsheading xl:text-xltabsheading lg:text-lgtabsheading md:text-mdtabsheading sm:text-smtabsheading font-bold dark:text-gray-200">
          Swap
        </h3>
      </div>
      <div className="grid grid-cols-1 2xl:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-1">
        <div className="me-0 2xl:me-2 xl:me-2 lg:me-2 md:me-0 sm:me-0 mb-3 2xl:mb-0 xl:mb-0 lg:mb-0 md:mb-3 sm:mb-3">
          <div className="block 2xl:flex xl:flex lg:flex md:flex sm:block justify-between mb-5 w-full">
            <div className={'bg-white dark:bg-gray-800 border dark:border-gray-700 py-5 px-7 rounded-borderbox me-0 2xl:me-2 xl:me-2 lg:me-2 md:me-2 sm:me-0 w-full 2xl:w-6/12 xl:w-6/12 lg:w-6/12 md:w-6/12 sm:w-full mb-3 2xl:mb-0 xl:mb-0 lg:mb-0 md:mb-0 sm:mb-3 ' + shadow}>
              <div className="flex justify-between mb-5">
                <h2 className="text-swapheading 2xl:text-xxlswapheading xl:text-xlswapheading lg:text-lgswapheading md:text-mdswapheading ms:text-smswapheading font-medium text-black dark:text-gray-200 me-2">
                  ICP
                </h2>
                <div>
                  <input
                    className="text-black dark:text-gray-200 text-right text-swapheading 2xl:text-xxlswapheading xl:text-xlswapheading lg:text-lgswapheading md:text-mdswapheading ms:text-smswapheading bg-transparent placeholder-black dark:placeholder-gray-400 focus:outline-none focus:border-transparent w-full caret-[#D8DDF7] dark:caret-blue-400"
                    type="text"
                    defaultValue={amount}
                    value={amount + ""}
                    min="0"
                    onChange={(e) => {
                      handleAmountChange(e);
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <strong className="text-base text-[#353535] dark:text-gray-300 font-medium me-1">
                  Balance:{icpLedger.accountBalance}
                </strong>

                <Link
                  role="button"
                  className="text-base font-blod text-[#A7B1D7] dark:text-blue-400 underline"
                  to={""}
                  onClick={() => handleMaxIcp()}
                >
                  Max
                </Link>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-[#bdbec4] dark:border-gray-700 py-5 px-7 rounded-borderbox me-0 2xl:ms-2 xl:ms-2 lg:ms-2 md:ms-2 sm:me-0 w-full 2xl:w-6/12 xl:w-6/12 lg:w-6/12 md:w-6/12 sm:w-full">
              <div className="flex justify-between mb-5 flex-wrap break-all">
                <h2 className="text-swapheading 2xl:text-xxlswapheading xl:text-xlswapheading lg:text-lgswapheading md:text-mdswapheading ms:text-smswapheading font-medium text-black dark:text-gray-200">
                  LBRY
                </h2>
                <h3 className="text-swapvalue text-right text-swapheading 2xl:text-xxlswapheading xl:text-xlswapheading lg:text-lgswapheading md:text-mdswapheading ms:text-smswapheading font-medium dark:text-gray-200">
                  {tentativeLBRY.toFixed(4)}
                </h3>
              </div>
              <div className="flex justify-between">
                <strong className="text-base text-[#353535] dark:text-gray-300 font-medium me-1">
                  Balance: {swap.lbryBalance} LBRY
                </strong>
              </div>
            </div>
          </div>
          <div className="terms-condition-wrapper flex tems-baseline mb-4">
            <p className="text-lg font-semibold pr-5 text-[#525252] dark:text-gray-300 w-9/12">{parseFloat(amount) < minimum_icp ? <>Please enter at least the minimum amount to proceed</> : <></>}</p>
          </div>
          <div>
            {user ? (
              <button
                type="button"
                className={`w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2 mb-6 
      ${parseFloat(amount) === 0 || amount === "" || parseFloat(amount) < minimum_icp || swap.loading ? 'text-[#808080] cursor-not-allowed' : 'bg-balancebox text-white cursor-pointer'}`}
                style={{
                  backgroundColor: parseFloat(amount) === 0 || amount === "" || parseFloat(amount) < minimum_icp || swap.loading ? '#525252' : '', // when disabled
                }}
                disabled={parseFloat(amount) === 0 || swap.loading || parseFloat(amount) < minimum_icp || amount === ""}
                onClick={handleSubmit}
              >
                {swap.loading ? (
                  <LoaderCircle size={18} className="animate-spin mx-auto" />
                ) : (
                  <>Swap</>
                )}
              </button>
            ) : (
              <div
                className="bg-balancebox text-white w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2 flex items-center justify-center white-auth-btn"
              >
                <Entry />
              </div>
            )}
            <div className="terms-condition-wrapper flex tems-baseline">
              <span className="text-[#FF37374D] mr-2 text-xl font-semibold">*</span>
              <p className="text-lg font-semibold pr-5 text-[#525252] dark:text-gray-300 w-9/12">If the transaction doesn't complete as expected, please check the redeem page to locate your tokens.</p>
            </div>
          </div>
        </div>
        <div className="border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 py-5 px-5 rounded-2xl ms-3">
          <ul className="ps-0">
            <li className="flex justify-between mb-5">
              <strong className="lg:text-lg md:text-base sm:text-sm font-semibold me-1 text-radiocolor dark:text-gray-200">
                Network Fees
              </strong>
              <span className="lg:text-lg md:text-base sm:text-sm font-semibold text-radiocolor dark:text-gray-200">
                {icp_fee} ICP
              </span>
            </li>
            <li className="flex justify-between mb-5">
              <strong className="lg:text-lg md:text-base sm:text-sm font-semibold me-1 text-radiocolor dark:text-gray-200">
                Send
              </strong>
              <span className="lg:text-lg md:text-base sm:text-sm font-semibold text-radiocolor dark:text-gray-200 break-all">
                {amount} ICP
              </span>
            </li>
            <li className="flex justify-between mb-5">
              <strong className="lg:text-lg md:text-base sm:text-sm font-semibold me-1 text-radiocolor dark:text-gray-200">
                Receive
              </strong>
              <span className="lg:text-lg md:text-base sm:text-sm font-semibold text-radiocolor dark:text-gray-200 break-all">
                {tentativeLBRY.toFixed(4)} LBRY
              </span>
            </li>
            <li className="flex justify-between mb-5">
              <strong className="lg:text-lg md:text-base sm:text-sm font-semibold me-1 text-radiocolor dark:text-gray-200">
                For each ICP you swap, you'll receive <span className="text-[#FF9900] dark:text-yellow-400">{tentativeLBRY}</span> LBRY tokens.
              </strong>
            </li>
            <li>
              <strong className="lg:text-lg md:text-base sm:text-sm font-semibold me-1 text-radiocolor dark:text-gray-200">
                Please review the details carefully, as swaps are irreversible and cannot be undone once confirmed.
              </strong>
            </li>
          </ul>
        </div>
      </div>


      <LoadingModal show={loadingModalV} message1={"Swap in Progress"} message2={"Your transaction from ICP to LBRY is being processed. This may take a few moments."} setShow={setLoadingModalV} />
      <SuccessModal show={successModalV} setShow={setSucessModalV} />
      <ErrorModal show={errorModalV.flag} setShow={setErrorModalV} title={errorModalV.title} message={errorModalV.message} />
    </div>
  );
};
export default SwapContent;
