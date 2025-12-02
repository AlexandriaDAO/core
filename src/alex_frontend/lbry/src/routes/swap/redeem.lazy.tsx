import { createLazyFileRoute } from "@tanstack/react-router";
import RedeemPage from "./../../pages/swap/RedeemPage";

export const Route = createLazyFileRoute("/swap/redeem")({
	component: RedeemPage,
});
