import React from "react";
import PerpetuaLayout from "./layouts/PerpetuaLayout";
import { NftManagerActor, PerpetuaActor } from "@/actors";
// import { TopupBalanceWarning } from '@/apps/Modules/shared/components/TopupBalanceWarning';

// Export public API
export * from "./features/shelf-management/hooks";
export * from "./features/shelf-settings";
export { parsePathInfo, usePerpetuaNavigation, useViewState } from "./routes";
export * from "./utils";

// Simple entry point
const Perpetua: React.FC = () => {
	return (
		<PerpetuaActor>
			<NftManagerActor>
				{/* <TopupBalanceWarning /> */}
				<PerpetuaLayout />
			</NftManagerActor>
		</PerpetuaActor>
	);
};

export default Perpetua; 