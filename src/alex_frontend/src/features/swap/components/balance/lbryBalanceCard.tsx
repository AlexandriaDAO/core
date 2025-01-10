import { useAppSelector } from "@/store/hooks/useAppSelector";
import React from "react";
import getLbryBalance from "../../thunks/lbryIcrc/getLbryBalance";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";

const LbryBalanceCard = () => {
    const dispatch = useAppDispatch();
    const icpSwap = useAppSelector(state => state.swap);
    const auth = useAppSelector((state) => state.auth);

    const handleRefresh = () => {
        if (!auth.user) return;
        dispatch(getLbryBalance(auth.user.principal))
        toast.info("Refreshing balance!")

    }
    return (<>

        <div className="w-full"
        // className='grid grid-cols-1 2xl:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1'
        >
            <div className='bg-balancebox py-5 px-7 me-3 rounded-3xl mb-5'>
                <div className='flex justify-between items-center mb-3'>
                    <div>
                        <h4 className='text-2xl font-medium text-white'>LBRY</h4>
                        <span className='text-sm font-regular text-lightgray '>Librarian Token</span>
                    </div>
                    <div>
                        <img src="images/lbry-logo.svg" alt="lbry-logo" className="w-12 h-12"/>
                    </div>
                </div>
                <div className="flex justify-between items-center mb-3">
                    <span className='text-base text-lightgray font-medium mb-1'>Balance</span>                 
                    <FontAwesomeIcon className="text-lightgray pe-2" role="button" icon={faRotate} onClick={() => { handleRefresh() }} />
                </div>
                

                <h4 className='text-2xl font-medium mb-1 text-white'>{icpSwap.lbryBalance}</h4>
                {/* <span className='text-base text-lightgray font-medium'>= $10</span> */}
            </div>
        </div>
    </>)
}
export default LbryBalanceCard;