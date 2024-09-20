import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { IoIosSearch } from "react-icons/io";
import useSession from "@/hooks/useSession";
import { ConfigProvider, Table, TableColumnsType } from "antd";
import EngineItemAction from "./components/EngineItemAction";
import { Engine } from "../../../../../src/declarations/alex_backend/alex_backend.did";

import './styles/table.module.css';
import { Index } from "meilisearch";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import fetchPublicEngines from "./thunks/fetchPublicEngines";
const columns: TableColumnsType<Engine> = [
	{
		title: "Name",
		dataIndex: "title",
		key: "title",
	},
	{
		title: "Creator",
		key: "owner",
		render: (_:any, record:Engine)=> <span>{record.owner.slice(0, 5) + '...' + record.owner.slice(-3)}</span>
	},
	{
		title: "Actions",
		key: "actions",
		align: "center",
		render: (_:any, record:Engine) => <EngineItemAction engine={record}/>,
	},
];
function PublicEngines() {
	const { actor } = useSession();
	const dispatch = useAppDispatch();

	const { engines, loading } = useAppSelector((state) => state.publicEngines);

	useEffect(() => {
		dispatch(fetchPublicEngines(actor));
	}, [actor]);

	// useEffect(()=>{
	// 	if(!meiliClient) return;
	// 	const fetchEngines = async()=>{
	// 		try{
	// 			setLoading(true);
	// 			setEngines([]);

	// 			const {results} = await meiliClient.getIndexes();

	// 			if(user) setEngines(results.filter(index=>index.uid !== user))
	// 			else setEngines(results);

	// 		}catch(ex){
	// 			message.error("Error fetching filters" + ex)
	// 		}finally{
	// 			setLoading(false)
	// 		}
	// 	}
	// 	fetchEngines();
	// },[user, meiliClient])


	return (
		<div className="flex-grow flex flex-col shadow-lg rounded-xl bg-white">
			<div className="flex flex-col gap-6 p-8">
				<div className="flex flex-col">
					<span className="font-syne text-xl font-bold">
						Published Engines
					</span>
					<span className="font-roboto-condensed text-base leading-[18px] font-normal ">
						Explore work of other ambitious users
					</span>
				</div>
				<div className="w-10/12 border-b-2 border-solid border-gray-500 flex items-center gap-2 px-2 py-2">
					<IoIosSearch />
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
		</div>
	);
}

export default PublicEngines;
