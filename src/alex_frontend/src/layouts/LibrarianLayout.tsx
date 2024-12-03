import React from "react";
import { Outlet } from "react-router";
import Header from "./parts/Header";
import LibrarianSidebar from "./parts/LibrarianSidebar";


const LibrarianLayout = () => {
	return (
		<>
            <Header/>
            <div className="flex-grow flex items-stretch">
                <div className="basis-1/5 flex-shrink-0">
                    <LibrarianSidebar />
                </div>
                <div className="flex-grow px-4 py-8">
                    <Outlet />
                </div>
            </div>
		</>
	);
};

export default LibrarianLayout;
