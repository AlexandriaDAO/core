import React, { useEffect, useState } from "react";
import { Table, Tag } from "antd"; // Using Ant Design for UI
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import getUserLogs from "../thunks/getUserLog";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import getEmporiumMarketLogs from "../thunks/getEmporiumMarketLogs";
import "./style.css"
import CopyHelper from "@/features/swap/components/copyHelper";

// Define table columns
const columns = [
    {
        title: <div className="text-lg font-bold text-[#333] font-[Syne] whitespace-nowrap dark:text-white">Timestamp</div>,
        dataIndex: "timestamp",
        key: "timestamp",
        width: "15%",
        render: (timestamp: string) => {
            const formattedDate = new Date(parseInt(timestamp) / 1e6).toLocaleString(); // Convert timestamp to readable format

            return (
                <div className="text-[15px]  p-0 bg-[transparent] border-[0] font-medium font-[Syne] dark:text-white">
                    🕒 {formattedDate}
                </div>
            );
        }
    },
    {
        title: <div className="text-lg font-bold text-[#333] font-[Syne] whitespace-nowrap dark:text-white">Token ID</div>,
        dataIndex: "token_id",
        key: "token_id",
        width: "15%",
        render: (token_id: string) => {

            return (
                <div className="text-[15px]  p-0 bg-[transparent] border-[0] font-medium font-[Syne] dark:text-white flex items-center">
                    {token_id.slice(0, 5) + "..." + token_id.slice(-4) }<span className="ml-2"><CopyHelper account={token_id} /></span> 
                </div>
            );
        }

    },
    {
        title: <div className="text-lg font-bold text-[#333] font-[Syne] whitespace-nowrap dark:text-white">Owner</div>,
        dataIndex: "seller",
        key: "seller",
        width: "15%",
        render: (seller: string) => {

            return (
                <div className="text-[15px]  p-0 bg-[transparent] border-[0] font-medium font-[Syne] dark:text-white flex items-center">
                     {seller.slice(0, 5) + "..." + seller.slice(-4) } <span className="ml-2"><CopyHelper account={seller} /></span> 
                </div>
            );
        }
    },

    {
        title: <div className="text-lg font-bold text-[#333] font-[Syne] whitespace-nowrap dark:text-white">Action</div>,
        dataIndex: "action",
        key: "action",
        width: "15%",
        render: (action: any, record: any) => {
                   let actionText = action?.type;
                   if (action?.type === "PriceUpdate" ) {
                       actionText = `📈 Price Changed: ${Number(action.oldPrice) / 1e8} → ${Number(action.newPrice) / 1e8} ICP`;
                   } else if (action?.type === "Sold") {
                       actionText = `🛍️ Sold at  ${Number(action.price) / 1e8}  ICP`;
                   } else if (action?.type === "Listed") {
                       actionText = `🏷️ Listed at ${Number(action.price) / 1e8} ICP`;
                   } else if (action?.type === "Removed") {
                       actionText = `🚫 Delisted`;
       
                   }
       
                   return (
                       <div style={{ overflowX: "auto" }}>
                           <Tag className="text-[15px] p-0 whitespace-nowrap bg-[transparent] border-[0] font-medium font-[Syne] dark:text-white">
                               {actionText}
                           </Tag>
                           {record.buyer && (
                               <div className="mt-[10px] text-sm text-[#333] whitespace-nowrap dark:text-white">
                                   🛒 <b>Buyer:</b> <span className="text-[#333] dark:text-white">{record.buyer}</span>
                               </div>
                           )}
                       </div>
                   );
               },
            
    },
];

const EmporiumMarketLogs: React.FC = () => {
    const dispatch = useAppDispatch();
    const logs = useAppSelector((state) => state.emporium.emporiumMarketLogs);

    useEffect(() => {
        dispatch(getUserLogs({}));
    }, [dispatch]);

    return (
        <div className="lg:pb-10 md:pb-8 sm:pb-6 xs:pb-4">
            <div className="lg:p-10 md:p-8 sm:p-6 xs:p-4 bg-white rounded-[8px] shadow-[0px 2px 10px rgba(0, 0, 0, 0.1)] overflow-x-auto dark:bg-[#3A3630]">
                <h1 className="text-center mb-[20px] text-[#333] dark:text-white">📜 Marketplace Logs</h1>
                {logs.logs.length > 0 && (
                    <Table
                        columns={columns}
                        dataSource={logs.logs}
                        rowKey="timestamp"
                        className="custom-pagination-table"
                        rowClassName={(record, index) =>
                            ` hover:bg-[#F3F3F2] dark:hover:bg-gray-600 ${index % 2 === 0 ? "bg-gray-100 dark:bg-[#2D2A26]" : "bg-white dark:bg-[#3A3630]"} `
                        }
                        pagination={{
                            total: Number(logs.totalPages) * 10,
                            pageSize: 10,
                            onChange: (page, pageSize) => {
                                dispatch(getEmporiumMarketLogs({ page, pageSize: pageSize.toString() }));
                            },
                            className: "custom-pagination"
                        }}
                        bordered
                        rowHoverable={false}
                        scroll={{ x: "max-content" }} 
                        style={{ minWidth: "100%" }}
                    />
                )}
            </div>
        </div>
        
    );
}

export default EmporiumMarketLogs;
