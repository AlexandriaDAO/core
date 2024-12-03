import React, { ReactNode, useEffect } from "react";
import AuthLayout from "../AuthLayout";
import Header from "../parts/Header";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router";


const LibrarianLayout = () => {
	return (
		<>
            <Header/>
            <div className="flex-grow flex items-stretch">
                <div className="basis-1/5 flex-shrink-0">
                    <Sidebar />
                </div>
                <div className="flex-grow px-4 py-8">
                    <Outlet />
                </div>
            </div>
		</>
	);
};

export default LibrarianLayout;
