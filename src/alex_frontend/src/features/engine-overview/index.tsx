import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { LoaderCircle } from "lucide-react";
import Overview from "./components/Overview";
import OverviewTabs from "./components/OverviewTabs";
import OverviewTabContent from "./components/OverviewTabContent";

function EngineOverview() {
	const {activeEngine, error, loading} = useAppSelector(state=>state.engineOverview)

    if(loading) return (
        <div className="flex justify-start items-center gap-1">
            <span>Loading Engine</span>
            <LoaderCircle size={20} className="animate animate-spin" />
        </div>
    )

    if(!activeEngine) return <span> {error ? error : 'No Engine Selected'}</span>

	return (
        <>
            <div className="flex flex-col gap-6 p-8">
                <Overview />
                <OverviewTabs />
            </div>
            <OverviewTabContent />
        </>
	);
}

export default EngineOverview;


