import React, { useEffect, useState } from "react";
import { Table, Tag } from "antd"; // Using Ant Design for UI
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import getUserLogs from "../thunks/getUserLog";
import { useAppSelector } from "@/store/hooks/useAppSelector";

// Define table columns
const columns = [
    {
        title: <div className="text-lg font-bold text-[#333] font-[Syne]">Timestamp</div>,
        dataIndex: "timestamp",
        key: "timestamp",
        width:"32%",
        render: (timestamp: string) => {
            const formattedDate = new Date(parseInt(timestamp) / 1e6).toLocaleString(); // Convert timestamp to readable format
            
            return (
                <div className="text-[15px]  p-0 whitespace-nowrap bg-[transparent] border-[0] font-medium font-[Syne]">
                    🕒 {formattedDate}
                </div>
            );
        }
    }
    ,
    {
        title:<div className="text-lg font-bold text-[#333] font-[Syne]">Token ID</div>,
        dataIndex: "token_id",
        key: "token_id",
        width:"32%",
        render: (token_id: string) => {
            
            return (
                <div className="text-[15px]  p-0 whitespace-nowrap bg-[transparent] border-[0] font-medium font-[Syne]">
                     {token_id.slice(0, 10) + "..." + token_id.slice(-2)}
                </div>
            );
        }

        
    },
    {
        title:<div className="text-lg font-bold text-[#333] font-[Syne]"> Action</div>,
        dataIndex: "action",
        key: "action",
        width:"32%",
        render: (action: any, record: any) => {
            let actionText = action?.type;
            if (action?.type === "PriceUpdate" && action.oldPrice !== action.newPrice) {
                actionText = `💰 Price Updated: ${Number(action.oldPrice) / 1e8} → ${Number(action.newPrice) / 1e8}`;
            } else if (action?.type === "Sold") {
                actionText = `✅ Sold`;
            } else if (action?.type === "Listed") {
                actionText = `📌 Listed`;
            } else if (action?.type === "Removed") {
                actionText = `❌ Removed`;

            }

            return (
                <div style={{ overflowX: "auto" }}>
                    <Tag className="text-[15px] p-0 whitespace-nowrap bg-[transparent] border-[0] font-medium font-[Syne]">
                        {actionText}
                    </Tag>
                    {record.buyer && (
                        <div className="mt-[10px] text-sm text-[#333] whitespace-nowrap">
                            🛒 <b>Buyer:</b> <span className="text-[#333]">{record.buyer}</span>
                        </div>
                    )}
                </div>
            );
        },
    },
];

const UserEmporiumLogs: React.FC = () => {
    const dispatch = useAppDispatch();
    const logs = useAppSelector((state) => state.emporium.userLogs);

    useEffect(() => {
        dispatch(getUserLogs({}));
    }, [dispatch]);

    return (
        <div className="p-[20px] bg-white rounded-[8px] shadow-[0px 2px 10px rgba(0, 0, 0, 0.1)] overflow-x-auto dark:bg-[#3A3630]">
            <h1 className="text-base text-center mb-[20px] text-[#333] font-medium dark:text-white">📜 Marketplace Logs</h1>
            {logs.logs.length > 0 && (
                <Table className="dark:bg-[#3A3630]"
                    columns={columns}
                    dataSource={logs.logs}
                    rowKey="timestamp"
                    pagination={{

                        total: Number(logs.totalPages) * 10,
                        pageSize: 10,
                        onChange: (page, pageSize) => {
                            dispatch(getUserLogs({ page, pageSize: pageSize.toString() }));
                        },
                    }}
                    scroll={{ x: "max-content" }} 
                    style={{ minWidth: "100%" }}
                    

                />
            )}
        </div>
    );
}

export default UserEmporiumLogs;
