import { createLazyFileRoute } from "@tanstack/react-router";
import CreatePage from "./../../pages/CreatePage";

export const Route = createLazyFileRoute("/_auth/create")({
	component: CreatePage,
});
