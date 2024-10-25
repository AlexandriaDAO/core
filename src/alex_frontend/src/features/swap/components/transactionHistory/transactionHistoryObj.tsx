import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { TransactionType } from "../../thunks/lbryIcrc/getTransactions";

const TransactionHistoryObj: React.FC<{
    timestamp: string;
    amount: string;
    type: string;
    from: string;
    to: string;
    fee:string;
  }> = ({ timestamp, amount, type, from, to,fee }) => {
  
    return (<>
        <tr className="border-b border-gray-300 hover:bg-gray-100">
            <td className="py-3 text-left text-base font-medium text-radiocolor">{timestamp}</td>
            <td className="py-3 px-6 text-left text-base font-medium text-radiocolor">
                <button className='bg-sendbtnbg bg-opacity-30 px-3 rounded-bordertb'>{type}</button>
            </td>
            <td className="py-3 px-6 text-left text-base font-medium text-radiocolor"><span>{amount}</span></td>
            <td className="py-3 px-6 text-left text-base font-medium text-radiocolor"><span>{fee}</span></td>
            <th className="py-3 px-6 text-left">
                <div className='text-base font-medium text-radiocolor items-center flex'>
                    <span className='me-2 flex'>Completed</span>
                    <FontAwesomeIcon icon={faCheck} />
                </div>
            </th>
        </tr>
    </>);
}
export default TransactionHistoryObj;