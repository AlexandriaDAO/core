import React, { ReactNode } from "react";
import AppHeader from "./parts/AppHeader";
interface MainLayoutProps {
	children: ReactNode;
}

const AppLayout: React.FC<MainLayoutProps> = ({ children }) => {
	return (
		<div className="min-h-screen min-w-screen flex flex-col bg-[#f4f4f4]">
			<AppHeader />
			{children}
		</div>
	);
};

export default AppLayout;
