import useSession from "@/hooks/useSession";
import { Button } from "@/lib/components/button";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { toast } from "sonner";
import React, { useEffect, useState } from "react";
import { ListX, LoaderCircle, RefreshCcw } from "lucide-react";

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
			await meiliClient.index(activeEngine.index).deleteAllDocuments();
			toast.info("Clear document task enqueued");
			await fetchStats()
		} else {
			toast.error("client not available, unable to clear documents.");
		}
	};
	const fetchStats = async()=>{
		try{
			setLoading(true);
			setStats(null);

			if(!activeEngine) throw new Error('No engine selected');

			if(!meiliClient) throw new Error('Client not available');

			const stats = await meiliClient.index(activeEngine.index).getStats();

			setStats(stats);
		}catch(ex){
			toast.error("Error fetching filters" + ex)
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
					{user && activeEngine && user.principal == activeEngine.owner && (
						<Button variant='muted' onClick={handleClearAll}>
							<ListX size={22} />
							<span>Clear All Documents</span>
						</Button>
					)}
					<div className="h-5 border-l border-gray-500"></div>
					<Button variant='muted' onClick={fetchStats}>
						<RefreshCcw
							size={18}
							className={`${loading ? 'animate-spin':''}`}
						/>
						<span>Refresh</span>
					</Button>
				</div>
			</div>
			{user && activeEngine && user.principal == activeEngine.owner &&
			<span className="p-4 font-roboto-condensed text-base leading-[18px] text-gray-500 hover:text-gray-800">
				Document deletion can take time, Check Recent tasks for status.
			</span>}
			<div className="p-4">
				{loading && (
					<LoaderCircle size={30} className="animate animate-spin" />
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