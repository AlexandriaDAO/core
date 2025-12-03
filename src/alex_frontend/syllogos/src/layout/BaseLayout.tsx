import React from "react";
import { Outlet } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { Toaster } from "@/lib/components/sonner";
import { useRiskWarning } from "@/hooks/useRiskWarning";
import RiskWarningModal from "@/components/RiskWarningModal";

import Header from "./Header";

const BaseLayout = () => {
	const { showRiskWarning, handleCloseRiskWarning } = useRiskWarning();

	return (
		<div className="min-h-screen min-w-screen flex flex-col bg-background">
			{showRiskWarning && (
				<RiskWarningModal
					onClose={handleCloseRiskWarning}
					open={showRiskWarning}
				/>
			)}

			<Header />

			<main className="flex-1 p-6">
				<Outlet />
			</main>

			<TanStackRouterDevtools />

			<ReactQueryDevtools initialIsOpen={false} />

			<Toaster />
		</div>
	);
};

export default BaseLayout;
