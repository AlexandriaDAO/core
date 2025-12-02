import { createLazyFileRoute } from "@tanstack/react-router";
import RulesPage from "../pages/RulesPage";

export const Route = createLazyFileRoute("/rules")({
	component: RulesPage,
});
