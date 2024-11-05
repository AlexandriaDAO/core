import React from "react";
import MainLayout from "@/layouts/MainLayout";
import Library from "@/apps/Modules/LibModules/nftSearch";
import ContentDisplay from "@/apps/Modules/AppModules/contentGrid";
import { useWipeOnUnmount } from "@/apps/Modules/shared/state/wiper";

function Alexandrian() {
	useWipeOnUnmount();
	return (
		<MainLayout>
			<Library />
			<ContentDisplay />
		</MainLayout>
	);
}

export default Alexandrian;
