import { initializeClient } from "src/ucg_frontend/src/services/meiliService";
import { useAppSelector } from "src/ucg_frontend/src/store/hooks/useAppSelector";
import { Table, message } from "antd";
import MeiliSearch from "meilisearch";
import React, { useEffect, useState } from "react";
import { FiRefreshCcw } from "react-icons/fi";
import { ImSpinner8 } from "react-icons/im";
import { MdOutlineClear } from "react-icons/md";
import { VscClearAll } from "react-icons/vsc";
const columns = [
	{
		title: "Task UID",
		dataIndex: "uid",
		key: "uid",
	},
	{
		title: "Status",
		dataIndex: "status",
		key: "status",
	},
	{
		title: "Type",
		dataIndex: "type",
		key: "type",
	},
];
const EngineTasks = () => {
	const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);

	const [loading, setLoading] = useState(true);
	const [client, setClient] = useState<MeiliSearch | null>(null);
	const [tasks, setTasks] = useState<any>(null);
	const { activeEngine } = useAppSelector((state) => state.engineOverview);
	const { user } = useAppSelector((state) => state.auth);

	const clearSelectedTasks = async () => {
		try {
			if (!client) throw new Error("Client not available");

			console.log(selectedRowKeys);
			await client.deleteTasks({ uids: selectedRowKeys });

			fetchTasks();
		} catch (ex) {
			console.error("Error clearing selected tasks", ex);
		}
	};

	const clearAllTasks = async () => {
		try {
			if (!client) throw new Error("Client not available");

			await client.deleteTasks({
				uids: tasks.map((task: any) => task.uid),
			});

			fetchTasks();
		} catch (ex) {
			console.error("Error clearing tasks", ex);
		}
	};

	const fetchTasks = async () => {
		try {
			setLoading(true);
			setClient(null);
			setTasks(null);

			const client = await initializeClient(
				activeEngine?.host,
				activeEngine?.key
			);
			if (!client) throw new Error("Client not available");

			const { results } = await client.getTasks();

			setClient(client);
			setTasks(results);
		} catch (ex) {
			message.error("Error fetching filters" + ex)
		} finally {
			setLoading(false);
			setSelectedRowKeys([]);
		}
	};

	useEffect(() => {
		fetchTasks();
	}, [activeEngine]);

	const onSelectChange = (newSelectedRowKeys: any[]) => {
		console.log("selectedRowKeys changed: ", newSelectedRowKeys);
		setSelectedRowKeys(newSelectedRowKeys);
	};

	const rowSelection = {
		selectedRowKeys,
		onChange: onSelectChange,
	};

	return (
		<div className="bg-white rounded-lg">
			<div className="flex justify-between items-center p-4 border-b border-solid border-black">
				<span className="font-roboto-condensed font-bold text-xl leading-6 text-black">
					Recent Tasks
				</span>
				<div className="flex items-center text-gray-500">
					<span className="px-2 font-roboto-condensed text-base leading-[18px] border-r border-gray-500">
						{selectedRowKeys.length > 0
							? `Selected ${selectedRowKeys.length} items`
							: ""}
					</span>
					{user == activeEngine?.owner && (
						<>
							<div
								onClick={clearSelectedTasks}
								className={`px-2 flex items-center gap-1 ${
									selectedRowKeys.length > 0
										? "cursor-pointer hover:text-gray-800"
										: "cursor-not-allowed text-gray-400"
								}  transition-all duration-100 border-r border-gray-500`}
							>
								<MdOutlineClear size={22} />
								<span className="font-roboto-condensed text-base leading-[18px] ">
									Clear Selected
								</span>
							</div>
							<div
								onClick={clearAllTasks}
								className="px-2 flex items-center gap-1 cursor-pointer hover:text-gray-800 transition-all duration-100 border-r border-gray-500"
							>
								<VscClearAll size={22} />
								<span className="font-roboto-condensed text-base leading-[18px] ">
									Clear All
								</span>
							</div>
						</>
					)}
					<div
						onClick={fetchTasks}
						className="px-2 flex items-center gap-1 cursor-pointer hover:text-gray-800 transition-all duration-100 "
					>
						<FiRefreshCcw
							size={18}
							className={`${loading ? "animate-spin" : ""}`}
						/>
						<span className="font-roboto-condensed text-base leading-[18px] ">
							Refresh
						</span>
					</div>
				</div>
			</div>
			<div className="p-4">

				<Table
					loading={loading}
					rowSelection={rowSelection}
					dataSource={tasks}
					columns={columns}
					rowKey="uid"
					size="small"
				/>

				{/* <ConfigProvider
					theme={{
						components: {
							Table: {
								headerBg: 'transparent',
								rowHoverBg: 'transparent',
							},
						},
					}}
				>
					<Table
						loading={loading}
						dataSource={engines}
						columns={columns}
						rowKey="id"
						size="middle"
					/>
				</ConfigProvider> */}
			</div>
		</div>
	);
};

export default EngineTasks;
