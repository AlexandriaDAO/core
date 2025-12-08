import { createLazyFileRoute } from "@tanstack/react-router";
import WritePage from "./../../pages/WritePage";

export const Route = createLazyFileRoute("/_auth/write")({
	component: WritePage,
});
