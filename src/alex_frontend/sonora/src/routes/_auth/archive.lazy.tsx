import { createLazyFileRoute } from "@tanstack/react-router";
import SonoraArchivePage from "./../../pages/ArchivePage";

export const Route = createLazyFileRoute("/_auth/archive")({
	component: SonoraArchivePage,
});
