import React, { lazy, Suspense } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { EngineOverviewTab } from "@/features/engine-overview/engineOverviewSlice";
import EngineBooks from "@/features/engine-books";

const EngineFilters = lazy(() => import("@/features/engine-filters"));
const EngineTasks = lazy(() => import("@/features/engine-tasks"));
const EngineStats = lazy(() => import("@/features/engine-stats"));

function OverviewTabContent() {
	const { activeTab } = useAppSelector(state=>state.engineOverview)

	return (
        <div className="px-8 py-4 flex flex-col gap-4">
            {/* Books is a default tab */}
            {activeTab == EngineOverviewTab.Books && <EngineBooks />}
            {activeTab == EngineOverviewTab.Filters && <Suspense fallback={<span>Loading Filters...</span>}><EngineFilters /></Suspense>}
            {activeTab == EngineOverviewTab.Tasks && <Suspense fallback={<span>Loading Tasks...</span>}><EngineTasks /></Suspense>}
            {activeTab == EngineOverviewTab.Stats && <Suspense fallback={<span>Loading Stats...</span>}><EngineStats /></Suspense>}
        </div>
	);
}

export default OverviewTabContent;