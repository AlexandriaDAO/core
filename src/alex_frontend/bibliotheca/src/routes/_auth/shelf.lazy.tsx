import { createLazyFileRoute } from "@tanstack/react-router";
import BibliothecaShelfPage from "./../../pages/ShelfPage";

export const Route = createLazyFileRoute("/_auth/shelf")({
	component: BibliothecaShelfPage,
});
