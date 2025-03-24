import React from "react";
import { PerpetuaLayout } from "./layouts";

// Export public API
export * from "./features/shelf-management/hooks";
export * from "./features/shelf-settings";
export * from "./features/slots";
export * from "./features/cards";
export { parsePathInfo, usePerpetuaNavigation, useViewState } from "./routes";
export { createFindSlotInShelf } from "./utils";

// Simple entry point
const Perpetua: React.FC = () => {
	return <PerpetuaLayout />;
};

export default Perpetua; 