import React from "react";
import MainLayout from "@/layouts/MainLayout";
import Library from "@/apps/LibModules/nftSearch";
import ContentDisplay from "@/apps/LibModules/contentDisplay";

function Alexandrian() {

	return (
		<MainLayout>
			<Library />
			<ContentDisplay />
		</MainLayout>
	);
}

export default Alexandrian;
