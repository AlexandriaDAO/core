import React, { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import EngineBooks from "../engine-books";
import EngineFilters from "../engine-filters";
import EngineTasks from "../engine-tasks";
import EngineStats from "../engine-stats";
import { EngineOverviewTab, setActiveEngine, setActiveTab } from "./engineOverviewSlice";
import updateEngineStatus from "./thunks/updateEngineStatus";
import { Button } from "@/lib/components/button";
import { LoaderCircle } from "lucide-react";
import { useUser } from "@/hooks/actors";
import { toast } from "sonner";
import Overview from "./components/Overview";
import OverviewTabs from "./components/OverviewTabs";
import OverviewTabContent from "./components/OverviewTabContent";
import { useParams } from "react-router-dom";
import fetchEngine from "./thunks/fetchEngine";
import OverviewActions from "./components/OverviewActions";



function EngineOverview() {

    const {id} = useParams()

	const {actor} = useUser()

	const dispatch = useAppDispatch();
	const {activeEngine, error, loading} = useAppSelector(state=>state.engineOverview)

	useEffect(()=>{

		if(!id || !actor) return;

		dispatch(fetchEngine({actor, id}))

	}, [id, actor])

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
                <OverviewActions />
                <Overview />
                <OverviewTabs />
            </div>
            <OverviewTabContent />
        </>
	);
}

export default EngineOverview;


