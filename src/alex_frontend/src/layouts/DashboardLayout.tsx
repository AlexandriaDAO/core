import React from "react";
import { Outlet } from "@tanstack/react-router";
import DashboardSidebar from "./parts/DashboardSidebar";


const DashboardLayout = () => {
	return (
		<>
            <div className="flex-grow flex items-stretch">
                <DashboardSidebar />
                <div className="flex-grow p-4">
                    <Outlet />
                </div>
            </div>
		</>
	);
};

export default DashboardLayout;
