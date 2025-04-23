import React from "react";
import PerpetuaLayout from "./layouts/PerpetuaLayout";
// import { TopupBalanceWarning } from '@/apps/Modules/shared/components/TopupBalanceWarning';

// Export public API
export * from "./features/shelf-management/hooks";
export * from "./features/shelf-settings";
export { parsePathInfo, usePerpetuaNavigation, useViewState } from "./routes";
export * from "./utils";

// Simple entry point
const Perpetua: React.FC = () => {
	return (
		<>
			{/* <TopupBalanceWarning /> */}
			<PerpetuaLayout />
		</>
	);
};

export default Perpetua; 