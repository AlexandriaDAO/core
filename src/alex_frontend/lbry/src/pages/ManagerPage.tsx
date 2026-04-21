import React from "react";
import { Helmet } from "react-helmet-async";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import MyEngines from "@/features/my-engines";
import EngineOverview from "@/features/engine-overview";
import PublicEngines from "@/features/public-engines";
import LibrarianCard from "@/components/LibrarianCard";

function ManagerPage() {
	const { activeEngine } = useAppSelector(
		(state) => state.engineOverview
	);
	return (
		<>
			<Helmet>
				<title>Manager | Alexandria</title>
				<meta name="description" content="Manage your NFTs and tokens on Alexandria." />
			</Helmet>
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