import { createLazyFileRoute } from "@tanstack/react-router";
import BibliothecaUploadPage from "./../../pages/UploadPage";

export const Route = createLazyFileRoute("/_auth/upload")({
	component: BibliothecaUploadPage,
});
