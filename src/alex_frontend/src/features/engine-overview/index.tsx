import React from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import EngineBooks from "../engine-books";
import EngineFilters from "../engine-filters";
import EngineTasks from "../engine-tasks";
import EngineStats from "../engine-stats";
import { EngineOverviewTab, setActiveEngine, setActiveTab } from "./engineOverviewSlice";
import updateEngineStatus, { EngineStatus } from "./thunks/updateEngineStatus";
import { Button } from "@/lib/components/button";
import { LoaderCircle } from "lucide-react";

function EngineOverview() {
	const dispatch = useAppDispatch();

	const { activeTab, activeEngine, loading } = useAppSelector(
		(state) => state.engineOverview
	);

    const { user } = useAppSelector(state => state.auth);

	const handleTabClick = (t: EngineOverviewTab): void => {
		dispatch(setActiveTab(t));
	};

    const handleEngineOverviewCloseClick = ()=>{
        dispatch(setActiveEngine(null))
    }

    const handleMoveToDraftClick = ()=>{
        if(activeEngine){
            dispatch(updateEngineStatus({engineId: activeEngine.id, status: EngineStatus.Draft}))
        }
    }

    const handlePublishEngine = ()=>{
        if(activeEngine){
            dispatch(updateEngineStatus({engineId: activeEngine.id, status: EngineStatus.Published}))
        }
    }


    const renderTabContent = () => {
		switch (activeTab) {
			case EngineOverviewTab.Books:
				return <EngineBooks />;
			case EngineOverviewTab.Filters:
				return <EngineFilters />;
			case EngineOverviewTab.Tasks:
				return <EngineTasks />;
			case EngineOverviewTab.Stats:
				return <EngineStats />;
			default:
				return <></>;
		}
	};
	return (
        <div className="flex flex-col shadow-lg rounded-xl bg-white">
            <div className="flex flex-col gap-6 p-8">
                <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-syne text-xl font-bold">
                            Engine Overview
                        </span>
                        {loading && (
                            <LoaderCircle size={20} className="animate animate-spin" />
                        )}
                    </div>
                    <div className="flex items-center">
                        {user && user == activeEngine?.owner && <>
                            { activeEngine?.status && 'Published' in activeEngine.status &&
                                <Button variant='muted' disabled={loading} onClick={handleMoveToDraftClick}>
                                    Move To Draft
                                </Button>
                            }
                            { activeEngine?.status && 'Draft' in activeEngine.status &&
                                <Button variant='muted' disabled={loading} onClick={handlePublishEngine}>
                                    Publish Engine
                                </Button>
                            }
                        </>}
                        <div className="h-5 border-l border-gray-500"></div>
                        <Button variant='muted' onClick={handleEngineOverviewCloseClick}>
                            Close Overview
                        </Button>
                    </div>
                </div>
                <div className="flex flex-col items-start">
                    <div className="flex flex-col">
                        <span className="font-roboto-condensed text-base leading-[18px] font-normal">
                            Title
                        </span>
                        <span className="font-syne text-2xl leading-7 font-bold tracking-widest">
                            History of Art Exploration
                        </span>
                    </div>
                    <div className="flex gap-[5vw] justify-between border-t border-solid border-black py-6">
                        <div className="flex flex-col gap-2">
                            <span className="font-roboto-condensed text-base leading-[18px] font-normal">
                                Created by
                            </span>
                            <span className="font-roboto-condensed text-base leading-[18px] font-medium">
                                {activeEngine?.owner.slice(0, 5) + '...' + activeEngine?.owner.slice(-3)}
                            </span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="font-roboto-condensed text-base leading-[18px] font-normal">
                                Index
                            </span>
                            <span className="font-roboto-condensed text-base leading-[18px] font-medium">
                                {activeEngine?.index}
                            </span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="font-roboto-condensed text-base leading-[18px] font-normal">
                                Created on
                            </span>
                            <span className="font-roboto-condensed text-base leading-[18px] font-medium">
                                Jan 1st 2024
                            </span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="font-roboto-condensed text-base leading-[18px] font-normal">
                                Books
                            </span>
                            <span className="font-roboto-condensed text-base leading-[18px] font-medium">
                                229
                            </span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="font-roboto-condensed text-base leading-[18px] font-normal">
                                Uses
                            </span>
                            <span className="font-roboto-condensed text-base leading-[18px] font-medium">
                                1009
                            </span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="font-roboto-condensed text-base leading-[18px] font-normal">
                                Status
                            </span>
                            {activeEngine?.status && 'Published' in activeEngine.status &&
                                <div className="flex gap-1 justify-start items-center">
                                    <span className="p-1.5 rounded-full bg-[#4AF77A]"></span>
                                    <span className="font-roboto-condensed text-base leading-[18px] font-medium">
                                        Published
                                    </span>
                                </div>
                            }
                            {activeEngine?.status && 'Draft' in activeEngine.status &&
                                <div className="flex gap-1 justify-start items-center">
                                    <span className="p-1.5 rounded-full bg-[#E27625]"></span>
                                    <span className="font-roboto-condensed text-base leading-[18px] font-medium">
                                        Draft
                                    </span>
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 justify-start items-center">
                    {Object.values(EngineOverviewTab).map((t) => (
                        <Button
                            key={t}
                            rounded="full"
                            onClick={() => handleTabClick(t)}
                            variant={activeTab == t ? 'inverted':'primary'}
                            className={activeTab == t ? 'pointer-events-none':''}
                        >
                            {t}
                        </Button>
                    ))}
                </div>
            </div>
            <div className="px-8 py-4 flex flex-col gap-4">
                {renderTabContent()}
            </div>
        </div>
	);
}

export default EngineOverview;


