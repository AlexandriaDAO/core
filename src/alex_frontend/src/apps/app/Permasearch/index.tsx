import React, { useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import ArweaveSearch from "@/apps/libmodules/arweave";

function Permasearch() {

	return (
		<MainLayout>
			<ArweaveSearch />
		</MainLayout>
	);
}

export default Permasearch;
