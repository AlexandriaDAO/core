import { useAppSelector } from "@/store/hooks/useAppSelector";
import React from "react";

const AlexBalanceCard = () => {
    const alex = useAppSelector(state => state.alex);

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
                        <img src="images/icp-logo.png" alt="icp-logo" />
                    </div>
                </div>
                <span className='text-base text-lightgray font-medium mb-1'>Balance</span>
                <h4 className='text-2xl font-medium mb-1 text-white'>{alex.alexBal}</h4>
                <span className='text-base text-lightgray font-medium'>= $10</span>
            </div>
        </div>
    </>)
}
export default AlexBalanceCard;