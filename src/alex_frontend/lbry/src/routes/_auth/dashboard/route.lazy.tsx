import DashboardLayout from "./../../../layout/DashboardLayout";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_auth/dashboard")({
	component: DashboardLayout,
});
