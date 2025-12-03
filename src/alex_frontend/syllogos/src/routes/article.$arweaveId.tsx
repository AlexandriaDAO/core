import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/article/$arweaveId")({
	loader: () => void 0,
});
