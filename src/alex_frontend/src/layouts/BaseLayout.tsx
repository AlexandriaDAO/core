import React, { ReactNode, useEffect } from "react";
import { Toaster } from "@/lib/components/sonner";
import useInitAuth from "@/features/auth/hooks/useInitAuth";
// Define the type for the component's props
interface BaseLayoutProps {
	children: ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
	useInitAuth();

	return (
		<div className="min-h-screen min-w-screen flex flex-col bg-[#f4f4f4]">
			{children}

			<Toaster />
		</div>
	);
};

export default BaseLayout;
