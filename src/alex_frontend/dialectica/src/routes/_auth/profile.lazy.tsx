import React from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
import ProfilePage from "./../../pages/ProfilePage";

export const Route = createLazyFileRoute("/_auth/profile")({
	component: () => React.createElement(ProfilePage),
});