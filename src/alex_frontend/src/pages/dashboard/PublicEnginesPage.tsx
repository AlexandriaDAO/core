import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import PublicEngines from "@/features/public-engines";

function PublicEnginesPage() {

	return (
		<DashboardLayout
			title="Public Engines"
			description="List of my created engines"
		>
			<PublicEngines />
		</DashboardLayout>
	);
}

export default PublicEnginesPage;