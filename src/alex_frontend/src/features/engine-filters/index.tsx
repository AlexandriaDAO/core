import useSession from "@/hooks/useSession";
import { Button } from "@/lib/components/button";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { toast } from "sonner";
import React, { ChangeEvent, useEffect, useState } from "react";
import { ListX, LoaderCircle, RefreshCcw } from "lucide-react";

enum EngineFilter {
	id = "Id",
	text = "Text",
	title = "Title",
	fiction = "Fiction",
	language = "Language",
	author_first = "Author First Name",
	author_last = "Author Last Name",
	type = "Type",
	era = "Publication Era",
	asset_id = "Asset Id",
}

const EngineFilters = () => {
	const {meiliClient} = useSession();

	const [loading, setLoading] = useState(true);

	const [filters, setFilters] = useState<any[]>([]);

	const { user } = useAppSelector((state) => state.auth);
	const { activeEngine } = useAppSelector((state) => state.engineOverview);

	const fetchFilters = async () => {
		try {
			setLoading(true);
			setFilters([]);

			if(!activeEngine) throw new Error('No engine selected');

			if(!meiliClient) throw new Error('Client not available');;

			const attributes = await meiliClient
				.index(activeEngine.index)
				.getFilterableAttributes();

			setFilters(attributes);
		} catch (ex) {
			toast.error("Error fetching filters" + ex)
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		fetchFilters();
	}, [activeEngine]);

	const handleFilterCheck = async (e: ChangeEvent<HTMLInputElement>) => {
		let newFilters = filters.filter((filter) => filter != e.target.name);
		if (e.target.checked) {
			newFilters.push(e.target.name);
		}

		if (meiliClient && activeEngine) {
			await meiliClient
				.index(activeEngine.index)
				.updateFilterableAttributes(newFilters);
			toast.info("Update Filters task enqueued");
			setFilters(newFilters);
		} else {
			toast.error("client not available, unable to update filters.");
		}
	};

	const handleFilterReset = async () => {
		if (meiliClient && activeEngine) {
			await meiliClient.index(activeEngine.index).resetFilterableAttributes();
			toast.info("Update Filters task enqueued");
			setFilters([]);
		} else {
			toast.error("client not available, unable to update filters.");
		}
	};

	return (
		<div className="bg-white rounded-lg">
			<div className="flex justify-between items-center p-4 border-b border-solid border-black">
				<span className="font-roboto-condensed font-bold text-xl leading-6 text-black">
					Applied Filters {filters.length}
				</span>

				<div className="flex items-center text-gray-500">
					{user && activeEngine && user.principal == activeEngine.owner && (
						<Button variant='muted' onClick={handleFilterReset}>
							<ListX size={22} />
							<span>Clear All</span>
						</Button>
					)}
					<div className="h-5 border-l border-gray-500"></div>
					<Button variant='muted' onClick={fetchFilters}>
						<RefreshCcw
							size={18}
							className={`${loading ? "animate-spin" : ""}`}
						/>
						<span>Refresh</span>
					</Button>
				</div>
			</div>
			{user && activeEngine && user.principal == activeEngine.owner  &&
			<span className="p-4 font-roboto-condensed text-base leading-[18px] text-gray-500 hover:text-gray-800">
				Filters can take time to update, Check Recent tasks for status.
			</span>}
			<div className="p-4 grid gap-y-8 gap-x-10 grid-flow-col grid-rows-4 justify-start">
				{loading ? (
					<LoaderCircle size={30} className="animate animate-spin" />
				) : (
					Object.entries(EngineFilter).map(([key, value]) => (
						<label
							key={key}
							className={`${user && activeEngine && user.principal == activeEngine.owner  ? 'cursor-pointer':'cursor-not-allowed'} flex items-center gap-2.5 font-roboto-condensed text-base font-normal ${
								value ? "text-black" : "text-[#8E8E8E]"
							}`}
						>
							<input
								className="w-5 h-5"
								type="checkbox"
								name={key}
								readOnly={user && activeEngine && user.principal != activeEngine.owner ? true: false}
								checked={filters.includes(key)}
								onChange={user && activeEngine && user.principal == activeEngine.owner  ? handleFilterCheck : ()=>{}}
							/>
							<span>{value}</span>
						</label>
					))
				)}
			</div>
		</div>
	);
};

export default EngineFilters;
