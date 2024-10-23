import React from "react";
import MainLayout from "@/layouts/MainLayout";
import Library from "@/apps/AppModules/library";
import ContentDisplay from "@/apps/AppModules/contentDisplay";

function Alexandrian() {

	return (
		<MainLayout>
			<Library />
			<ContentDisplay />
		</MainLayout>
	);
}

export default Alexandrian;
