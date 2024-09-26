import React, { ReactNode, useEffect } from "react";
import Header from "@/components/AppHeader";
interface MainLayoutProps {
	children: ReactNode;
}

const AppLayout: React.FC<MainLayoutProps> = ({ children }) => {
	return (
		<div className="min-h-screen min-w-screen flex flex-col bg-[#f4f4f4]">
			<Header />
			{children}
		</div>
	);
};

export default AppLayout;
