import React, { ReactNode, useEffect } from "react";
import AuthLayout from "../AuthLayout";
import Header from "../parts/Header";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
	children: ReactNode;
    title?: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, description, action }) => {
	return (
		<AuthLayout>
            <Header/>
            <div className="flex-grow flex items-stretch">
                <div className="basis-1/5">
                    <Sidebar />
                </div>
                <div className="flex-grow px-4 py-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold">{title}</h1>
                        {action}
                    </div>
                    <div className="font-roboto-condensed bg-white rounded-lg shadow-md p-6">
                        {description && <div className="mb-6 text-gray-600 font-roboto-condensed">{description}</div>}

                        {children}
                    </div>
                </div>

            </div>
		</AuthLayout>
	);
};

export default DashboardLayout;
