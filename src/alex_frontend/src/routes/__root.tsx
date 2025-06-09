import { createRootRoute } from "@tanstack/react-router";
import BaseLayout from "@/layouts/BaseLayout";
import RouteFallback from "@/components/fallbacks/RouteFallback";
import NotFoundPage from "@/pages/NotFoundPage";

export const Route = createRootRoute({
	component: BaseLayout,
    errorComponent: RouteFallback,
    notFoundComponent: NotFoundPage
});
