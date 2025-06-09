import React from "react";
import Header from "./parts/Header";
import { Outlet } from "@tanstack/react-router";

const MainLayout = () => {
	return (
		<>
			<Header />
			<Outlet />
		</>
	);
};

export default MainLayout;
