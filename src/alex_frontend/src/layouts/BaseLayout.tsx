import React from "react";
import { Toaster } from "@/lib/components/sonner";
import { Outlet } from "@tanstack/react-router";
import { useRiskWarning } from "@/hooks/useRiskWarning";
import RiskWarningModal from "@/components/RiskWarningModal";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import Header from "@/layouts/parts/Header";
// Define the type for the component's props

const BaseLayout = () => {
    const { showRiskWarning, handleCloseRiskWarning } = useRiskWarning();
    // const { isLoading } = useRouterState();

	return (
		<div className="min-h-screen min-w-screen flex flex-col bg-background">
			{showRiskWarning && <RiskWarningModal onClose={handleCloseRiskWarning} open={showRiskWarning} />}

			<Header />

			<Outlet />

			<TanStackRouterDevtools />
			<ReactQueryDevtools initialIsOpen={false} />

			<Toaster />
		</div>
	);
};

export default BaseLayout;
