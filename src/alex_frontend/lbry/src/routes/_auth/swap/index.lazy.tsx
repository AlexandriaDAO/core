import ExchangePage from "./../../../pages/swap";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_auth/swap/")({
	component: ExchangePage,
});
