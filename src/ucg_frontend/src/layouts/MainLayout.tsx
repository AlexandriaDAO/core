import React, { ReactNode } from "react";
import Header from "@/components/Header";
import Categories from "@/features/categories";
// Define the type for the component's props
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
