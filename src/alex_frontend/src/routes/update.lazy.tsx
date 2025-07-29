import { createLazyFileRoute } from "@tanstack/react-router";
import UpdatePage from "@/pages/UpdatePage";

export const Route = createLazyFileRoute("/update")({
	component: UpdatePage,
});