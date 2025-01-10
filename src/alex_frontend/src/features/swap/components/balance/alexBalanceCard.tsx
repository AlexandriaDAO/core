import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import getAlexPrice from "../../thunks/alexIcrc/getAlexPrice";
import getAccountAlexBalance from "../../thunks/alexIcrc/getAccountAlexBalance";
import { toast } from "sonner";

const AlexBalanceCard = () => {
    const alex = useAppSelector(state => state.alex);
    const auth = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();
    const [alexBalUsd, setAlexBalUsd] = useState(0);

    const handleRefresh = () => {
        if (!auth.user) return;
        dispatch(getAccountAlexBalance(auth.user.principal))
        toast.info("Refreshing balance!")

    }
    useEffect(() => {
        dispatch(getAlexPrice())
    }, [])

    useEffect(() => {
        setAlexBalUsd(Number(alex.alexBal) * Number(alex.alexPriceUsd));
    }, [alex.alexBal, alex.alexPriceUsd])
    return (<>
        <div className="w-full"
        // className='grid grid-cols-1 2xl:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1'
        >
            <div className='bg-balancebox py-5 px-7 me-3 rounded-3xl mb-5'>
                <div className='flex justify-between items-center mb-3'>
                    <div>
                        <h4 className='text-2xl font-medium text-white'>ALEX</h4>
                        <span className='text-sm font-regular text-lightgray '>Alexandria Token</span>
                    </div>
                    <div>
                        <img src="images/alex-logo.svg" alt="alex-logo" className="w-12 h-12"/>
                    </div>
                </div>
                <div className="flex justify-between items-center mb-3">
                    <span className='text-base text-lightgray font-medium mb-1'>Balance</span>
                    <FontAwesomeIcon className="text-lightgray pe-2" role="button" icon={faRotate} onClick={() => { handleRefresh() }} />
                </div>
                <div className="flex text-center justify-between">

                    <h4 className='text-2xl font-medium mb-1 text-white'>{alex.alexBal}</h4>
                    <span className='text-base text-lightgray font-medium'> ≈ $ {alexBalUsd.toFixed(2)}</span>
                </div>
            </div>
        </div>
    </>)
}
export default AlexBalanceCard;