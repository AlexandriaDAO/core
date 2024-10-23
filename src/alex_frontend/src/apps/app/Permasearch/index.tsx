import React, { useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import ArweaveSearch from "@/apps/AppModules/arweave";
import ContentDisplay from "@/apps/AppModules/contentDisplay";

function Permasearch() {

	return (
		<MainLayout>
			<ArweaveSearch />
			<ContentDisplay />
		</MainLayout>
	);
}

export default Permasearch;
