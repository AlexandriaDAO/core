import React from "react";
import PerpetuaLayout from "./layouts/PerpetuaLayout";

// Export public API
export * from "./features/shelf-management/hooks";
export * from "./features/shelf-settings";
export * from "./features/items";
export { parsePathInfo, usePerpetuaNavigation, useViewState } from "./routes";
export * from "./utils";

// Simple entry point
const Perpetua: React.FC = () => {
	return <PerpetuaLayout />;
};

export default Perpetua; 