import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/post/$arweaveId")({
	loader: () => void 0,
});