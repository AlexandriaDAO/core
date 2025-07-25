import { createLazyFileRoute } from "@tanstack/react-router";
import HomePage from "@/pages/HomePage";

// const HomePage = lazyLoad(async () => {
// 	console.log("🏠 LAZY LOADING: HomePage starting...");
// 	await wait(10000); // 2 second delay for testing
// 	console.log("🏠 LAZY LOADING: HomePage complete!");
// 	return import("@/pages/HomePage");
// });

export const Route = createLazyFileRoute("/")({
	component: HomePage,
});