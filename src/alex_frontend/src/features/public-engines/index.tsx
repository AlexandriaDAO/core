import React, { useEffect } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { ConfigProvider, Table, TableColumnsType } from "antd";
import EngineItemAction from "./components/EngineItemAction";

import './styles/table.module.css';
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import fetchPublicEngines from "./thunks/fetchPublicEngines";
import { Search } from "lucide-react";
import { useUser } from "@/hooks/actors";
import { SerializedEngine } from "../my-engines/myEnginesSlice";
const columns: TableColumnsType<SerializedEngine> = [
	{
		title: "Name",
		dataIndex: "title",
		key: "title",
	},
	{
		title: "Creator",
		key: "owner",
		render: (_:any, record:SerializedEngine)=> <span>{record.owner.toString().slice(0, 5) + '...' + record.owner.toString().slice(-3)}</span>
	},
	{
		title: "Actions",
		key: "actions",
		align: "center",
		render: (_:any, record:SerializedEngine) => <EngineItemAction engine={record}/>,
	},
];
function PublicEngines() {
	const {actor} = useUser();
	const dispatch = useAppDispatch();

	const { engines, loading } = useAppSelector((state) => state.publicEngines);

	useEffect(() => {
		if(!actor) return;
		dispatch(fetchPublicEngines(actor))
	}, [actor]);

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex flex-col">
				<span className="font-syne text-xl font-bold">
					Published Engines
				</span>
				<span className="font-roboto-condensed text-base leading-[18px] font-normal ">
					Explore work of other ambitious users
				</span>
			</div>
			<div className="w-10/12 border-b-2 border-solid border-gray-500 flex items-center gap-2 px-2 py-2">
				<Search />
				<input
					type="text"
					placeholder="Search"
					className="font-roboto-condensed font-normal text-base flex-grow rounded border-0 ring-0 focus:ring-0 outline-none"
				/>
			</div>
			<ConfigProvider
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
			</ConfigProvider>
		</div>
	);
}

export default PublicEngines;
