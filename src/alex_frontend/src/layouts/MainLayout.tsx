import React, { ReactNode, useEffect } from "react";
import BaseLayout from "./BaseLayout";
import Header from "./parts/Header";
import { Outlet } from "react-router";
// Define the type for the component's props

const MainLayout = () => {
	return (
		<>
			<Header />
			<Outlet />
		</>
	);
};

export default MainLayout;
