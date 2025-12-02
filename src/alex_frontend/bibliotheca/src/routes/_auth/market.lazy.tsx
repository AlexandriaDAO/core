import { createLazyFileRoute } from "@tanstack/react-router";
import BibliothecaMarketPage from "./../../pages/MarketPage";

export const Route = createLazyFileRoute("/_auth/market")({
	component: BibliothecaMarketPage,
});
