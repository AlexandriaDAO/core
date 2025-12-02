import { createLazyFileRoute } from "@tanstack/react-router";
import BibliothecaLibraryPage from "./../../pages/LibraryPage";

export const Route = createLazyFileRoute("/_auth/library")({
	component: BibliothecaLibraryPage,
});
