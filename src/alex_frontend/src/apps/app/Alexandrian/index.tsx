import React from "react";
import Library from "@/apps/Modules/LibModules/nftSearch";
import ContentDisplay from "@/apps/Modules/AppModules/contentGrid";
import { useWipeOnUnmount } from "@/apps/Modules/shared/state/wiper";

function Alexandrian() {
	useWipeOnUnmount();
	return (
		<>
			<Library />
			<ContentDisplay />
		</>
	);
}

export default Alexandrian;
