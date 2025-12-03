import { createLazyFileRoute } from "@tanstack/react-router";
import AuthorPage from "./../pages/AuthorPage";

export const Route = createLazyFileRoute("/author/$principal")({
	component: AuthorPage,
});
