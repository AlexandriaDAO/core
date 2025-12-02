import { createLazyFileRoute } from "@tanstack/react-router";
import BrowsePage from "./../../pages/BrowsePage";

export const Route = createLazyFileRoute("/_auth/browse")({
	component: BrowsePage,
});
