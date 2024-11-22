import React from "react";
import MainLayout from "@/layouts/MainLayout";
import { useWipeOnUnmount } from "@/apps/Modules/shared/state/wiper";

function Miner() {
	useWipeOnUnmount();
	return (
		<MainLayout>
			Miner Comming Soon !
		</MainLayout>
	);
}

export default Miner;
