import { createRootRoute } from "@tanstack/react-router";
import RouteFallback from "@/components/fallbacks/RouteFallback";

import BaseLayout from "./../layout/BaseLayout";
import NotFoundPage from "@/pages/NotFoundPage";

export const Route = createRootRoute({
	component: BaseLayout,
	errorComponent: RouteFallback,
	notFoundComponent: NotFoundPage,
});
