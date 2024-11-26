import useSession from "@/hooks/useSession";
import { Button } from "@/lib/components/button";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Table } from "antd";
import { toast } from "sonner";
import React, { useEffect, useState } from "react";
import { ListX, RefreshCcw, X } from "lucide-react";
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


			await meiliClient.deleteTasks({ uids: selectedRowKeys, indexUids:[activeEngine.index] });

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
				indexUids: [activeEngine.index]
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

			const { results } = await meiliClient.getTasks({indexUids:[activeEngine.index]});


			setTasks(results);
		} catch (ex) {
			toast.error("Error fetching filters" + ex)
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
					{user && activeEngine && user.principal == activeEngine.owner && (
						<>
							<Button disabled={selectedRowKeys.length <= 0} variant='muted' onClick={clearSelectedTasks}>
								<X size={22} />
								<span>Clear Selected</span>
							</Button>
							<div className="h-5 border-l border-gray-500"></div>
							<Button variant='muted' onClick={clearAllTasks}>
								<ListX size={22} />
								<span>Clear All</span>
							</Button>
						</>
					)}
					<div className="h-5 border-l border-gray-500"></div>
					<Button variant='muted' onClick={fetchTasks}>
						<RefreshCcw
							size={18}
							className={`${loading ? "animate-spin" : ""}`}
						/>
						<span>Refresh</span>
					</Button>
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
