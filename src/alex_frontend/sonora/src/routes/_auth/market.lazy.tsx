import { createLazyFileRoute } from "@tanstack/react-router";
import SonoraMarketPage from "./../../pages/MarketPage";

export const Route = createLazyFileRoute("/_auth/market")({
	component: SonoraMarketPage,
});
