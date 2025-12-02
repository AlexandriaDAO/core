import InfoLayout from "./../../layout/InfoLayout";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/info")({
	component: InfoLayout,
});
