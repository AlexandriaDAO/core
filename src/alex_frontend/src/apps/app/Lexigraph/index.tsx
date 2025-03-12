import React from "react";
import { LexigraphLayout } from "./layouts";

// Export public API
export * from "./features/shelf-management/hooks";
export * from "./features/shelf-settings";
export * from "./features/slots";
export * from "./features/cards";
export { parsePathInfo, useLexigraphNavigation, useViewState } from "./routes";
export { createFindSlotInShelf } from "./utils";

// Simple entry point
const Lexigraph: React.FC = () => {
	return <LexigraphLayout />;
};

export default Lexigraph; 