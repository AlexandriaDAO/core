import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { EngineOverviewTab } from "@/features/engine-overview/engineOverviewSlice";
import EngineBooks from "@/features/engine-books";
import EngineFilters from "@/features/engine-filters";
import EngineTasks from "@/features/engine-tasks";
import EngineStats from "@/features/engine-stats";

function OverviewTabContent() {
	const { activeTab } = useAppSelector(state=>state.engineOverview)

	return (
        <div className="px-8 py-4 flex flex-col gap-4">
            {activeTab == EngineOverviewTab.Books && <EngineBooks />}
            {activeTab == EngineOverviewTab.Filters && <EngineFilters />}
            {activeTab == EngineOverviewTab.Tasks && <EngineTasks />}
            {activeTab == EngineOverviewTab.Stats && <EngineStats />}
        </div>
	);
}

export default OverviewTabContent;