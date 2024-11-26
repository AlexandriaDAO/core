import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/lib/components/button";
import MyEngines from "@/features/my-engines";
import AddEngine from "@/features/my-engines/components/AddEngine";

function EnginesPage() {

	return (
		<DashboardLayout
			title="My Engines"
			description="List of my created engines"
			action={<AddEngine />}
		>
			<MyEngines />
		</DashboardLayout>
	);
}

export default EnginesPage;