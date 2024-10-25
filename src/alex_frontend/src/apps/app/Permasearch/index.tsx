import React, { useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import ArweaveSearch from "@/apps/LibModules/arweaveSearch";
import ContentDisplay from "@/apps/LibModules/contentDisplay";

function Permasearch() {

	return (
		<MainLayout>
			<ArweaveSearch />
			<ContentDisplay />
		</MainLayout>
	);
}

export default Permasearch;
