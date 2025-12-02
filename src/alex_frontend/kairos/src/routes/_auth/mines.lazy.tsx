import React from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
import MinesPage from "./../../pages/MinesPage";

export const Route = createLazyFileRoute("/_auth/mines")({
	component: () => React.createElement(MinesPage),
});
