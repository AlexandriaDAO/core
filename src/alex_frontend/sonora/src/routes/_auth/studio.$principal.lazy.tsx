import { createLazyFileRoute } from "@tanstack/react-router";
import SonoraStudioPage from "./../../pages/StudioPage";

export const Route = createLazyFileRoute("/_auth/studio/$principal")({
	component: SonoraStudioPage,
});
