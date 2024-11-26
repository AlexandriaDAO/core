import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Button } from "@/lib/components/button";
import { EngineOverviewTab, setActiveTab } from "../engineOverviewSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";

function OverviewTabs() {
    const dispatch = useAppDispatch();
	const { activeTab } = useAppSelector(
		(state) => state.engineOverview
	);

    const handleTabClick = (t: EngineOverviewTab): void => {
		dispatch(setActiveTab(t));
	};

	return (
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
	);
}

export default OverviewTabs;