import { createLazyFileRoute } from "@tanstack/react-router";
import StakePage from "./../../pages/swap/StakePage";

export const Route = createLazyFileRoute("/swap/stake")({
	component: StakePage,
});
