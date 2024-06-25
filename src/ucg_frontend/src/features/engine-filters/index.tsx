import { initializeClient } from "@/services/meiliService";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { message } from "antd";
import MeiliSearch from "meilisearch";
import React, { ChangeEvent, useEffect, useState } from "react";
import { FiRefreshCcw } from "react-icons/fi";
import { ImSpinner8 } from "react-icons/im";
import { VscClearAll } from "react-icons/vsc";

enum EngineFilter {
	fiction = "Fiction",
	type = "Type",
	title = "Title",
	subtype = "SubType",
	pubyear = "PublicationYear",
	author = "Author",
	id = "Id",
}

const EngineFilters = () => {
	// Initial state with three checkboxes

	const [loading, setLoading] = useState(true);
	const [client, setClient] = useState<MeiliSearch | null>(null);

	const [filters, setFilters] = useState<any[]>([]);

	const { user } = useAppSelector((state) => state.auth);
	const { activeEngine } = useAppSelector((state) => state.engineOverview);

	const fetchFilters = async () => {
		try {
			setLoading(true);
			setFilters([]);
			setClient(null);

			const client = await initializeClient(
				activeEngine?.host,
				activeEngine?.key
			);
			if (!client) throw new Error("Client not available");

			const attributes = await client
				.index(activeEngine!.index)
				.getFilterableAttributes();

			setClient(client);
			setFilters(attributes);
		} catch (ex) {
			message.error("Error fetching filters" + ex)
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

		if (client && activeEngine?.index) {
			await client
				.index(activeEngine.index)
				.updateFilterableAttributes(newFilters);
			message.info("Update Filters task enqueued");
			setFilters(newFilters);
		} else {
			message.error("client not available, unable to update filters.");
		}
	};

	const handleFilterReset = async () => {
		if (client && activeEngine?.index) {
			await client.index(activeEngine.index).resetFilterableAttributes();
			message.info("Update Filters task enqueued");
			setFilters([]);
		} else {
			message.error("client not available, unable to update filters.");
		}
	};

	return (
		<div className="bg-white rounded-lg">
			<div className="flex justify-between items-center p-4 border-b border-solid border-black">
				<span className="font-roboto-condensed font-bold text-xl leading-6 text-black">
					Applied Filters {filters.length}
				</span>

				<div className="flex items-center text-gray-500">
					{user == activeEngine?.owner && (
						<div
							onClick={handleFilterReset}
							className="px-2 flex items-center gap-1 cursor-pointer hover:text-gray-800 transition-all duration-100 border-r border-gray-500"
						>
							<VscClearAll size={22} />
							<span className="font-roboto-condensed text-base leading-[18px] ">
								Clear All
							</span>
						</div>
					)}

					<div
						onClick={fetchFilters}
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
			{user == activeEngine?.owner &&
			<span className="p-4 font-roboto-condensed text-base leading-[18px] text-gray-500 hover:text-gray-800">
				Filters can take time to update, Check Recent tasks for status.
			</span>}
			<div className="p-4 grid gap-y-8 gap-x-10 grid-flow-col grid-rows-4 justify-start">
				{loading ? (
					<ImSpinner8 size={30} className="animate animate-spin" />
				) : (
					Object.entries(EngineFilter).map(([key, value]) => (
						<label
							key={key}
							className={`${user == activeEngine?.owner ? 'cursor-pointer':'cursor-not-allowed'} flex items-center gap-2.5 font-roboto-condensed text-base font-normal ${
								value ? "text-black" : "text-[#8E8E8E]"
							}`}
						>
							<input
								className="w-5 h-5"
								type="checkbox"
								name={key}
								readOnly={user != activeEngine?.owner}
								checked={filters.includes(key)}
								onChange={user == activeEngine?.owner ? handleFilterCheck : ()=>{}}
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
