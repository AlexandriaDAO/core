import { createLazyFileRoute } from "@tanstack/react-router";
import HistoryPage from "./../../pages/swap/HistoryPage";

export const Route = createLazyFileRoute("/swap/history")({
	component: HistoryPage,
});
