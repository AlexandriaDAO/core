import UpdatePage from "@/pages/UpdatePage";
import { createFileRoute } from "@tanstack/react-router";

const Route = createFileRoute("/update")({
	component: UpdatePage,
});

export { Route };
