import { createLazyFileRoute } from "@tanstack/react-router";
import SinglePostPage from "./../../pages/SinglePostPage";

export const Route = createLazyFileRoute("/_auth/post/$arweaveId")({
	component: SinglePostPage,
});