import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import EngineOverview from "@/features/engine-overview";
import { NavLink, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/lib/components/button";

function EngineOverviewPage() {
	const navigate = useNavigate();

	const GoBack = ()=>{
		navigate(-1)
	}

	return (
		<DashboardLayout
			title="Engine Overview"
			description="Overview of selected Engine"
			action={
				<Button onClick={GoBack} variant="link" rounded="full" scale="icon" className="p-2">
					<ArrowLeft size={20}/>
				</Button>
			}
		>
			<EngineOverview />
		</DashboardLayout>
	);
}

export default EngineOverviewPage;