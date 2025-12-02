import { createLazyFileRoute } from "@tanstack/react-router";
import SwapLayout from "./../../../layout/SwapLayout";

export const Route = createLazyFileRoute("/_auth/swap")({
	component: SwapLayout,
});
