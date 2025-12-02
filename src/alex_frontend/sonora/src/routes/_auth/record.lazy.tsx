import { createLazyFileRoute } from "@tanstack/react-router";
import SonoraRecordPage from "./../../pages/RecordPage";

export const Route = createLazyFileRoute("/_auth/record")({
	component: SonoraRecordPage,
});
