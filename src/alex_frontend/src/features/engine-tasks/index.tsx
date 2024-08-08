import useSession from "@/hooks/useSession";
import { initializeClient } from "@/services/meiliService";
import { useAppSelector } from "@/store/hooks/useAppSelector";
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
	const {meiliClient} = useSession();

	const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);

	const [loading, setLoading] = useState(true);

	const [tasks, setTasks] = useState<any>(null);
	const { activeEngine } = useAppSelector((state) => state.engineOverview);
	const { user } = useAppSelector((state) => state.auth);

	const clearSelectedTasks = async () => {
		try {
			if(!activeEngine) throw new Error('No engine selected');

			if(!meiliClient) throw new Error('Client not available');;


			await meiliClient.deleteTasks({ uids: selectedRowKeys, indexUids:[activeEngine] });

			fetchTasks();
		} catch (ex) {
			console.error("Error clearing selected tasks", ex);
		}
	};

	const clearAllTasks = async () => {
		try {
			if(!activeEngine) throw new Error('No engine selected');

			if(!meiliClient) throw new Error('Client not available');;

			await meiliClient.deleteTasks({
				uids: tasks.map((task: any) => task.uid),
				indexUids: [activeEngine]
			});

			fetchTasks();
		} catch (ex) {
			console.error("Error clearing tasks", ex);
		}
	};

	const fetchTasks = async () => {
		try {
			setLoading(true);
			setTasks(null);

			if(!activeEngine) throw new Error('No engine selected');

			if(!meiliClient) throw new Error('Client not available');;

			const { results } = await meiliClient.getTasks({indexUids:[activeEngine]});


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
					{user == activeEngine && (
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
