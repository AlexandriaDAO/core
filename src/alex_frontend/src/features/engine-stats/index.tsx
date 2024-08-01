import useSession from "@/hooks/useSession";
import { initializeClient } from "@/services/meiliService";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { message } from "antd";
import MeiliSearch from "meilisearch";
import React, { useEffect, useState } from "react";
import { FiRefreshCcw } from "react-icons/fi";
import { ImSpinner8 } from "react-icons/im";
import { VscClearAll } from "react-icons/vsc";

const EngineStats = () => {
	const {meiliClient} = useSession();

	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState<any>(null);

	const { activeEngine } = useAppSelector(
		(state) => state.engineOverview
	);
	const { user } = useAppSelector(
		(state) => state.auth
	);
	const handleClearAll = async () => {
		if (meiliClient && activeEngine) {
			await meiliClient.index(activeEngine).deleteAllDocuments();
			message.info("Clear document task enqueued");
			await fetchStats()
		} else {
			message.error("client not available, unable to clear documents.");
		}
	};
	const fetchStats = async()=>{
		try{
			setLoading(true);
			setStats(null);

			if(!activeEngine) throw new Error('No engine selected');

			if(!meiliClient) throw new Error('Client not available');

			const stats = await meiliClient.index(activeEngine).getStats();

			setStats(stats);
		}catch(ex){
			message.error("Error fetching filters" + ex)
		}finally{
			setLoading(false)
		}
	}
	useEffect(()=>{
		fetchStats();
	},[activeEngine])

	return (
		<div className="bg-white rounded-lg">
			<div className="flex justify-between items-center p-4 border-b border-solid border-black">
				<span className="font-roboto-condensed font-bold text-xl leading-6 text-black">
					Cluster Stats
				</span>
				<div className="flex items-center text-gray-500">
				{user == activeEngine &&
					<div onClick={handleClearAll} className="px-2 flex items-center gap-1 cursor-pointer hover:text-gray-800 transition-all duration-100 border-r border-gray-500">
						<VscClearAll size={22} />
						<span className="font-roboto-condensed text-base leading-[18px] ">
							Clear All Documents
						</span>
					</div>
}
					<div onClick={fetchStats} className="px-2 flex items-center gap-1 cursor-pointer hover:text-gray-800 transition-all duration-100 ">
						<FiRefreshCcw
							size={18}
							className={`${loading ? 'animate-spin':''}`}
						/>
						<span className="font-roboto-condensed text-base leading-[18px] ">
							Refresh
						</span>
					</div>
				</div>
			</div>
			{user == activeEngine &&
			<span className="p-4 font-roboto-condensed text-base leading-[18px] text-gray-500 hover:text-gray-800">
				Document deletion can take time, Check Recent tasks for status.
			</span>}
			<div className="p-4">
				{loading && (
					<ImSpinner8 size={30} className="animate animate-spin" />
				)}

				{!loading && !stats && <span>Engine maybe down, Please check engine configurations</span>}

				{!loading && stats &&
					<pre className="font-roboto-condensed font-normal text-xl">
						<code>{JSON.stringify(stats, null, 2)}</code>
					</pre>
				}
			</div>
		</div>
	);
};

export default EngineStats;