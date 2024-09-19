import React, { ReactNode, useEffect } from "react";
import Header from "@/components/Header";
interface MainLayoutProps {
	children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
	return (
		<div className="min-h-screen min-w-screen flex flex-col bg-[#f4f4f4]">
			<Header />
			{children}
		</div>
	);
};

export default MainLayout;
