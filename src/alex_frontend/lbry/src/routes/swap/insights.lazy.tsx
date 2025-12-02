import { createLazyFileRoute } from "@tanstack/react-router";
import InsightsPage from "./../../pages/swap/InsightsPage";

export const Route = createLazyFileRoute("/swap/insights")({
	component: InsightsPage,
});
