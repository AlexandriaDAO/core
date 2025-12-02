import { createLazyFileRoute } from "@tanstack/react-router";
import SonoraUploadPage from "./../../pages/UploadPage";

export const Route = createLazyFileRoute("/_auth/upload")({
	component: SonoraUploadPage,
});
