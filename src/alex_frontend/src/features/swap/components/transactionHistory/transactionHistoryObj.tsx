import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useNavigate } from "react-router";
import { useTheme } from "@/providers/ThemeProvider";

const TransactionHistoryObj: React.FC<{
    timestamp: string;
    amount: string;
    type: string;
    from: string;
    to: string;
    fee: string;
    index: number;
}> = ({ timestamp, amount, type, from, to, fee, index }) => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const handleClick = (id: any) => {
        localStorage.setItem("tab", "trx");
        navigate("transaction?id=" + id);
    }

    return (<>
        <tr className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'}`} role="button" onClick={() => { handleClick(index) }}>
            <td className="py-3 text-left text-base font-medium text-foreground">{timestamp}</td>
            <td className="py-3 px-6 text-left text-base font-medium text-foreground">
                <button className={`${type === "mint" ? "bg-mintbtnbg" : "bg-sendbtnbg"} bg-opacity-30 px-3 rounded-bordertb`}>{type}</button>
            </td>
            <td className="py-3 px-6 text-left text-base font-medium text-foreground"><span>{amount}</span></td>
            <td className="py-3 px-6 text-left text-base font-medium text-foreground"><span>{fee}</span></td>
            <th className="py-3 px-6 text-left">
                <div className='text-base font-medium text-foreground items-center flex'>
                    <span className='me-2 flex'>Completed</span>
                    <FontAwesomeIcon icon={faCheck} />
                </div>
            </th>
        </tr>
    </>);
}
export default TransactionHistoryObj;