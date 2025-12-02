import { createLazyFileRoute } from "@tanstack/react-router";
import BurnPage from "./../../../pages/swap/BurnPage";

export const Route = createLazyFileRoute("/_auth/swap/burn")({
	component: BurnPage,
});
