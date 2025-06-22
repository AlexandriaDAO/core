import { createLazyFileRoute } from "@tanstack/react-router";
import RedeemPage from "@/pages/exchange/RedeemPage";

export const Route = createLazyFileRoute("/exchange/redeem")({
	component: RedeemPage,
});
