import React, { useEffect, useState } from "react";
import { Table, Tag } from "antd"; // Using Ant Design for UI
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import getUserLogs from "../thunks/getUserLog";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import getEmporiumMarketLogs from "../thunks/getEmporiumMarketLogs";

// Define table columns
const columns = [
    {
        title: <div className="text-lg font-bold text-[#333] font-[Syne]">Timestamp</div>,
        dataIndex: "timestamp",
        key: "timestamp",
        width: "19%",
        render: (timestamp: string) => {
            const formattedDate = new Date(parseInt(timestamp) / 1e6).toLocaleString(); // Convert timestamp to readable format

            return (
                <div className="text-[15px]  p-0 whitespace-nowrap bg-[transparent] border-[0] font-medium font-[Syne]">
                    🕒 {formattedDate}
                </div>
            );
        }
    },
    {
        title: <div className="text-lg font-bold text-[#333] font-[Syne]">Token ID</div>,
        dataIndex: "token_id",
        key: "token_id",
        width: "19%",
        render: (token_id: string) => {

            return (
                <div className="text-[15px]  p-0 whitespace-nowrap bg-[transparent] border-[0] font-medium font-[Syne]">
                    {token_id.slice(0, 10) + "..." + token_id.slice(-2)}
                </div>
            );
        }

    },
    {
        title: <div className="text-lg font-bold text-[#333] font-[Syne]">Seller</div>,
        dataIndex: "seller",
        key: "seller",
        width: "19%",
        render: (seller: string) => {

            return (
                <div className="text-[15px]  p-0 whitespace-nowrap bg-[transparent] border-[0] font-medium font-[Syne]">
                    {seller}
                </div>
            );
        }
    },
    {
        title: <div className="text-lg font-bold text-[#333] font-[Syne]">Buyer</div>,
        dataIndex: "buyer",
        key: "buyer",
        width: "15%",

        render: (buyer: string | null) => {

            return (
                <div className="text-[15px]  p-0 whitespace-nowrap bg-[transparent] border-[0] font-medium font-[Syne]">
                    {buyer ? buyer : ""}
                </div>
            );
        }
    },
    {
        title: <div className="text-lg font-bold text-[#333] font-[Syne]">Action</div>,
        dataIndex: "action",
        key: "action",
        width: "19%",
        render: (action: any) =>
            action.type === "PriceUpdate"
                ? `Price Updated: ${Number(action.oldPrice) / 1e8} → ${Number(action.newPrice) / 1e8} `
                : action.type,
    },
];

const EmporiumMarketLogs: React.FC = () => {
    const dispatch = useAppDispatch();
    const logs = useAppSelector((state) => state.emporium.emporiumMarketLogs);

    useEffect(() => {
        dispatch(getUserLogs({}));
    }, [dispatch]);

    return (
        <div className="p-10 bg-white rounded-[8px] shadow-[0px 2px 10px rgba(0, 0, 0, 0.1)] overflow-x-auto dark:bg-[#3A3630]">
            <h1 className="text-center mb-[20px] text-[#333] dark-[text-white]">📜 Marketplace Logs</h1>
            {logs.logs.length > 0 && (
                <Table
                    columns={columns}
                    dataSource={logs.logs}
                    rowKey="timestamp"
                    pagination={{
                        total: Number(logs.totalPages) * 10,
                        pageSize: 10,
                        onChange: (page, pageSize) => {
                            dispatch(getEmporiumMarketLogs({ page, pageSize: pageSize.toString() }));
                        },
                    }}
                    bordered
                    scroll={{ x: "max-content" }} 
                    style={{ minWidth: "100%" }}
                />
            )}
        </div>
    );
}

export default EmporiumMarketLogs;
