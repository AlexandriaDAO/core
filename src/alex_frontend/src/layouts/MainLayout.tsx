import React, { ReactNode, useEffect } from "react";
import BaseLayout from "./BaseLayout";
import Header from "./parts/Header";
// Define the type for the component's props
interface MainLayoutProps {
	children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
	return (
		<BaseLayout>
			<Header />
			{children}
		</BaseLayout>
	);
};

export default MainLayout;
