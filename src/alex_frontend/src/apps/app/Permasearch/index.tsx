import React, { useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import ArweaveSearch from "@/apps/Modules/LibModules/arweaveSearch";
import ContentDisplay from "@/apps/Modules/AppModules/contentGrid";

function Permasearch() {

	return (
		<MainLayout>
			<ArweaveSearch />
			<ContentDisplay />
		</MainLayout>
	);
}

export default Permasearch;
