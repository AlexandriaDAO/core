import React from "react";
import { Table, Tag } from "antd";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import getMarketLogs from "../thunks/getMarketLogs";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import CopyHelper from "@/features/swap/components/copyHelper";
import useEmporium from "@/hooks/actors/useEmporium";
import "./style.css"

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

const MarketLogs: React.FC = () => {
    const dispatch = useAppDispatch();

    const {actor} = useEmporium();

    const {logs, totalPages, pageSize} = useAppSelector((state) => state.imporium);

    return (
        <Table
            columns={columns}
            dataSource={logs}
            rowKey="timestamp"
            className="custom-pagination-table"
            rowClassName={(record, index) =>
                ` hover:bg-[#F3F3F2] dark:hover:bg-gray-600 ${index % 2 === 0 ? "bg-gray-100 dark:bg-[#2D2A26]" : "bg-white dark:bg-[#3A3630]"} `
            }
            pagination={{
                total: totalPages * 10,
                pageSize: 10,
                onChange: (page, pageSize) => {
                    if(!actor) return;
                    dispatch(getMarketLogs({actor, page, pageSize }));
                },
                className: "custom-pagination"
            }}
            bordered
            rowHoverable={false}
            scroll={{ x: "max-content" }} 
            style={{ minWidth: "100%" }}
        />

    );
}

export default MarketLogs;