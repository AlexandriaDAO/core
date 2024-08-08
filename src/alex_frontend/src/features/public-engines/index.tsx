import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { IoIosSearch } from "react-icons/io";
import useSession from "@/hooks/useSession";
import { ConfigProvider, message, Table } from "antd";
import EngineItemAction from "./components/EngineItemAction";
import './styles/table.module.css';
import { Index } from "meilisearch";
const columns = [
	{
		title: "Engines",
		key: "uid",
		render: (_:any, record:Index)=> <span>{record.uid}</span>
	},
	{
		title: "",
		key: "actions",
		render: (_:any, record:Index) => <EngineItemAction engine={record.uid}/>,
	},
];
function PublicEngines() {
	const { meiliClient } = useSession();

	const [engines, setEngines] = useState<Index<Record<string, any>>[]>([])

	const { user } = useAppSelector((state) => state.auth);

	const [loading, setLoading] = useState(true);

	useEffect(()=>{
		if(!meiliClient) return;
		const fetchEngines = async()=>{
			try{
				setLoading(true);
				setEngines([]);

				const {results} = await meiliClient.getIndexes();

				if(user) setEngines(results.filter(index=>index.uid !== user))
				else setEngines(results);

			}catch(ex){
				message.error("Error fetching filters" + ex)
			}finally{
				setLoading(false)
			}
		}
		fetchEngines();
	},[user, meiliClient])


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
						rowKey="uid"
						size="middle"
					/>
				</ConfigProvider>
			</div>
		</div>
	);
}

export default PublicEngines;
