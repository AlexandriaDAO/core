import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { faAngleLeft, faAngleRight, faCheck } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { TransactionType } from "../../thunks/lbryIcrc/getTransactions";
import MainLayout from "@/layouts/MainLayout";



const DetailTransaction = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const swap = useAppSelector(state => state.swap);
    const [transactaion, setTransaction] = useState<TransactionType>();
    useEffect(() => {
        const id = searchParams.get("id");
        setTransaction(swap?.transactions[Number(id)] || null);
        if (swap.transactions.length === 0) {
            navigate("/swap");
        }
    }, [searchParams])

    return (<>
        <>        <div className="overflow-x-auto lg:overflow-x-auto">
            <div className="container pt-10 px-3">
                <div className="bread-crumbs">
                    <nav className="flex items-center space-x-2 text-gray-500">
                        <a href="/" className="hover:text-gray-600 color:black-gray-300">Home</a>
                        <span className="w-1"><FontAwesomeIcon icon={faAngleRight} /></span>
                        <a href="/category" className="hover:text-gray-600 color:black-gray-300">Transaction History</a>
                        <span className="w-1"><FontAwesomeIcon icon={faAngleRight} /></span>
                        <a href="/category/product" className="text-gray-600  color:black-gray-300">Transaction Info</a>
                    </nav>
                </div>
            </div>
            <div className="container pt-10 pb-10 px-3">
                <div className="back-btn pb-8">
                    <span className="w-1 mr-3">
                        <FontAwesomeIcon icon={faAngleLeft} />
                    </span>
                    <a
                        href="/"
                        className="color:black-gray-300 text-base"
                        onClick={(e) => {
                            e.preventDefault(); // Prevent the default anchor behavior
                            window.history.back(); // Go back to the previous page
                        }}
                    >
                        Back
                    </a>            </div>
                <div className="table-wrapper">
                    <div className="table-content pb-5">
                        <h4 className="text-2xl text-black">Transaction</h4>
                    </div>
                    <div className="tranication-table overflow-x-auto lg:overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <tbody>
                                <tr className="border-b border-gray-300 hover:bg-gray-100">
                                    <th className="text-lg font-medium text-black items-center flex py-3 w-2/5 text-left">Timestamp
                                        <FontAwesomeIcon icon={faQuestionCircle} className='text-[#cccccc] text-2xl ml-3 position-relative w-5' />
                                    </th>
                                    <td className="text-base font-medium text-black-gray text-[#353535] w-9/12 text-left">{transactaion?.timestamp}</td>
                                </tr>
                                <tr className="border-b border-gray-300 hover:bg-gray-100">
                                    <th className="text-lg font-medium text-black items-center flex py-3 w-2/5">Type
                                        <FontAwesomeIcon icon={faQuestionCircle} className='text-[#cccccc] text-2xl ml-3 position-relative w-5' />
                                    </th>
                                    <td className="text-base font-medium text-black-gray w-9/12">
                                        <span className={`${transactaion?.type === "mint" ? "bg-mintbtnbg" : "bg-sendbtnbg"} bg-opacity-30 px-3 rounded-bordertb`}>{transactaion?.type}</span></td>
                                </tr>
                                <tr className="border-b border-gray-300 hover:bg-gray-100">
                                    <th className="text-lg font-medium text-black items-center flex py-3 w-2/5">Status
                                        <FontAwesomeIcon icon={faQuestionCircle} className='text-[#cccccc] text-2xl ml-3 position-relative w-5' />
                                    </th>
                                    <td className="text-base font-medium text-black-gray text-[#353535] w-9/12">Completed
                                        <span className="ml-2">
                                            <FontAwesomeIcon icon={faCheck} />
                                        </span>
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-300 hover:bg-gray-100">
                                    <th className="text-lg font-medium text-black items-center flex py-3 w-2/5">From
                                        <FontAwesomeIcon icon={faQuestionCircle} className='text-[#cccccc] text-2xl ml-3 position-relative w-5' />
                                    </th>
                                    <td className="text-base font-medium text-black-gray text-[#353535] w-9/12">{transactaion?.from}</td>
                                </tr>
                                <tr className="border-b border-gray-300 hover:bg-gray-100">
                                    <th className="text-lg font-medium text-black items-center flex py-3">To
                                        <FontAwesomeIcon icon={faQuestionCircle} className='text-[#cccccc] text-2xl ml-3 position-relative w-5 w-2/5' />
                                    </th>
                                    <td className="text-base font-medium text-black-gray text-[#353535] w-9/12">{transactaion?.to}</td>
                                </tr>
                                <tr className="border-b border-gray-300 hover:bg-gray-100">
                                    <th className="text-lg font-medium text-black items-center flex py-3 w-2/5">Amount
                                        <FontAwesomeIcon icon={faQuestionCircle} className='text-[#cccccc] text-2xl ml-3 position-relative w-5' />
                                    </th>
                                    <td className="text-base font-medium text-black-gray text-[#353535] w-9/12">{transactaion?.amount}</td>
                                </tr>
                                <tr className="border-b border-gray-300 hover:bg-gray-100">
                                    <th className="text-lg font-medium text-black items-center flex py-3 w-2/5">Fee
                                        <FontAwesomeIcon icon={faQuestionCircle} className='text-[#cccccc] text-2xl ml-3 position-relative w-5' />
                                    </th>
                                    <td className="text-base font-medium text-black-gray text-[#353535] w-9/12">{transactaion?.fee}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        </>
    </>)
}
export default DetailTransaction;