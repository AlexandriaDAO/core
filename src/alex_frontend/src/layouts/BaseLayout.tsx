import React, { ReactNode, useEffect } from "react";
import { Toaster } from "@/lib/components/sonner";
import useInitAuth from "@/features/auth/hooks/useInitAuth";
import { Outlet } from "react-router";
import { useRiskWarning } from "@/hooks/useRiskWarning";
import RiskWarningModal from "@/components/RiskWarningModal";
// Define the type for the component's props

const BaseLayout = () => {
    const { showRiskWarning, handleCloseRiskWarning } = useRiskWarning();

	return (
		<div className="min-h-screen min-w-screen flex flex-col bg-[#f4f4f4]">
			{showRiskWarning && <RiskWarningModal onClose={handleCloseRiskWarning} open={showRiskWarning} />}

			<Outlet />

			<Toaster />
		</div>
	);
};

export default BaseLayout;
