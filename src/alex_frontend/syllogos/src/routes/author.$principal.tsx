import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/author/$principal")({
	loader: () => void 0,
});
