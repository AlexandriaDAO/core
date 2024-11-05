import React from "react";
import MainLayout from "@/layouts/MainLayout";
import ArweaveSearch from "@/apps/Modules/LibModules/arweaveSearch";
import ContentDisplay from "@/apps/Modules/AppModules/contentGrid";
import { useWipeOnUnmount } from "@/apps/Modules/shared/state/wiper";

function Permasearch() {
	useWipeOnUnmount();

	return (
		<MainLayout>
			<ArweaveSearch />
			<ContentDisplay />
		</MainLayout>
	);
}

export default Permasearch;
