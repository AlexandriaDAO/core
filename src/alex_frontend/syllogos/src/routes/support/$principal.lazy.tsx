import { createLazyFileRoute } from "@tanstack/react-router";
import SupportAuthorPage from "./../../pages/SupportAuthorPage";

export const Route = createLazyFileRoute("/support/$principal")({
	component: SupportAuthorPage,
});
