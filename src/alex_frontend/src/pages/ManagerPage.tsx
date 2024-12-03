import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import MyEngines from "@/features/my-engines";
import EngineOverview from "@/features/engine-overview";
import PublicEngines from "@/features/public-engines";
import LibrarianCard from "@/components/LibrarianCard";
import MainLayout from "@/layouts/MainLayout";

function ManagerPage() {
	const { activeEngine } = useAppSelector(
		(state) => state.engineOverview
	);
	return (
		<>
			<div className="flex-grow flex items-start p-4 gap-4">
				<div className="basis-1/4 flex flex-col items-start gap-10">
					<MyEngines />
					<LibrarianCard />
				</div>

				<div className="flex-grow flex flex-col gap-4">
					{activeEngine ? <EngineOverview /> : <PublicEngines />}
				</div>
			</div>
		</>
	);
}

export default ManagerPage;