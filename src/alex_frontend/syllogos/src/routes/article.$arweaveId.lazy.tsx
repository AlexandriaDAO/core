import { createLazyFileRoute } from "@tanstack/react-router";
import ArticlePage from "./../pages/ArticlePage";

export const Route = createLazyFileRoute("/article/$arweaveId")({
	component: ArticlePage,
});
