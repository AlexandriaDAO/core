import React, { useEffect, useState } from "react";
import { Table, Tag } from "antd"; // Using Ant Design for UI
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import getUserLogs from "../thunks/getUserLog";
import { useAppSelector } from "@/store/hooks/useAppSelector";

// Define table columns
const columns = [
    {
        title: "Timestamp",
        dataIndex: "timestamp",
        key: "timestamp",
        render: (timestamp: string) => 
            new Date(parseInt(timestamp) / 1e6).toLocaleString(), // Convert to readable format
    },
    {
        title: "Token ID",
        dataIndex: "token_id",
        key: "token_id",
        render: (token_id: string) => token_id.slice(0, 10) + "..." // Shorten token ID for better UI
    },
    {
        title: "Action",
        dataIndex: "action",
        key: "action",
        render: (action: any, record: any) => {
            let actionText = action?.type;
            let color = "blue"; // Default color for tags

            if (action?.type === "PriceUpdate" && action.oldPrice !== action.newPrice) {
                actionText = `💰 Price Updated: ${Number(action.oldPrice) / 1e8} → ${Number(action.newPrice) / 1e8}`;
                color = "orange";
            } else if (action?.type === "Sold") {
                actionText = `✅ Sold`;
                color = "green";
            } else if (action?.type === "Listed") {
                actionText = `📌 Listed`;
                color = "blue";
            } else if (action?.type === "Removed") {
                actionText = `❌ Removed`;
                color = "red";
            }

            return (
                <div>
                    <Tag color={color} style={{ fontSize: "14px", padding: "5px 10px" }}>
                        {actionText}
                    </Tag>
                    {record.buyer && (
                        <div style={{ marginTop: "5px", fontSize: "12px", color: "#555" }}>
                            🛒 <b>Buyer:</b> <span style={{ color: "#333" }}>{record.buyer}</span>
                        </div>
                    )}
                </div>
            );
        },
    },
];

const UserEmporiumLogs: React.FC = () => {
    const dispatch = useAppDispatch();
    const logs = useAppSelector((state) => state.emporium.logs);

    useEffect(() => {
        dispatch(getUserLogs({}));
    }, [dispatch]);

    return (
        <div style={{ padding: "20px", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)" }}>
            <h1 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>📜 Marketplace Logs</h1>
            {logs.length > 0 && (
                <Table
                    columns={columns}
                    dataSource={logs}
                    rowKey="timestamp"
                    pagination={{ pageSize: 8 }} // Add pagination for better UX
                    bordered // Add table borders
                />
            )}
        </div>
    );
}

export default UserEmporiumLogs;
