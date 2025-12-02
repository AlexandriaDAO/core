import { createLazyFileRoute } from "@tanstack/react-router";
import FairplayPage from "../pages/FairplayPage";

export const Route = createLazyFileRoute("/fairplay")({
	component: FairplayPage,
});
