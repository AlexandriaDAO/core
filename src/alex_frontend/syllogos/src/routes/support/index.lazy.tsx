import { createLazyFileRoute } from "@tanstack/react-router";
import SupportPage from "./../../pages/SupportPage";

export const Route = createLazyFileRoute("/support/")({
	component: SupportPage,
});
