import React, { useEffect } from "react";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { clearSelected } from "@/features/sonora/sonoraSlice";

function SonoraLayout() {
	const location = useLocation();
	const dispatch = useAppDispatch();

	// Clear audio when navigating to different pages
	useEffect(() => {
		dispatch(clearSelected());
	}, [location.pathname, dispatch]);

	return (
		<div className="flex-grow bg-background p-4 grid grid-rows-[auto_auto_1fr] gap-8 min-h-0">
			<div className="flex flex-col">
				<h1 className="text-xxltabsheading font-syne font-bold text-center text-primary">
					Sonora
				</h1>
				<h3 className="text-smtabsheading text-center text-muted-foreground font-roboto-condensed">
					Create, discover and trade audio content
				</h3>
			</div>

			<div className="bg-card rounded-bordertb shadow">
				<nav
					className="flex flex-wrap items-center justify-center gap-2 p-2"
					aria-label="Tabs"
				>
					<Link
						to="/app/sonora"
						className="px-6 py-2 rounded-bordertb font-medium text-tabsheading transition-colors duration-200"
						activeProps={{
							className:
								"bg-primary text-primary-foreground shadow-md",
						}}
						inactiveProps={{
							className:
								"bg-transparent text-muted-foreground hover:bg-muted hover:text-primary",
						}}
						activeOptions={{
							exact: true,
						}}
					>
						Browse
					</Link>

					<Link
						to="/app/sonora/upload"
						className="px-6 py-2 rounded-bordertb font-medium text-tabsheading transition-colors duration-200"
						activeProps={{
							className:
								"bg-primary text-primary-foreground shadow-md",
						}}
						inactiveProps={{
							className:
								"bg-transparent text-muted-foreground hover:bg-muted hover:text-primary",
						}}
					>
						Upload
					</Link>

					<Link
						to="/app/sonora/record"
						className="px-6 py-2 rounded-bordertb font-medium text-tabsheading transition-colors duration-200"
						activeProps={{
							className:
								"bg-primary text-primary-foreground shadow-md",
						}}
						inactiveProps={{
							className:
								"bg-transparent text-muted-foreground hover:bg-muted hover:text-primary",
						}}
					>
						Record
					</Link>

					<Link
						to="/app/sonora/archive"
						className="px-6 py-2 rounded-bordertb font-medium text-tabsheading transition-colors duration-200"
						activeProps={{
							className:
								"bg-primary text-primary-foreground shadow-md",
						}}
						inactiveProps={{
							className:
								"bg-transparent text-muted-foreground hover:bg-muted hover:text-primary",
						}}
					>
						Archive
					</Link>

					<Link
						to="/app/sonora/studio"
						className="px-6 py-2 rounded-bordertb font-medium text-tabsheading transition-colors duration-200"
						activeProps={{
							className:
								"bg-primary text-primary-foreground shadow-md",
						}}
						inactiveProps={{
							className:
								"bg-transparent text-muted-foreground hover:bg-muted hover:text-primary",
						}}
					>
						Studio
					</Link>

					<Link
						to="/app/sonora/market"
						className="px-6 py-2 rounded-bordertb font-medium text-tabsheading transition-colors duration-200"
						activeProps={{
							className:
								"bg-primary text-primary-foreground shadow-md",
						}}
						inactiveProps={{
							className:
								"bg-transparent text-muted-foreground hover:bg-muted hover:text-primary",
						}}
					>
						Market
					</Link>
				</nav>
			</div>

			<Outlet />
		</div>
	);
}

export default SonoraLayout;
