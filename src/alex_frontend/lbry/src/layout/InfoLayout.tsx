import React from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";

function InfoLayout() {
	const router = useRouterState();
	const currentPath = router.location.pathname;

	const isFaqActive =
		currentPath === "/info" ||
		currentPath === "/info/" ||
		currentPath === "/info/faq" ||
		currentPath === "/info/faq/";

	return (
		<div className="flex-grow bg-background p-4 md:p-8 overflow-auto">
			<div className="max-w-4xl mx-auto">
				<div className="flex justify-center mb-6">
					<div className="inline-flex bg-balancebox rounded-lg p-1">
						<Link
							to="/info/faq"
							className={`px-4 py-2 rounded-md transition-all duration-200 text-tabsheading font-roboto-condensed ${
								isFaqActive
									? "bg-gray-800 text-brightyellow"
									: "text-gray-400 hover:text-gray-200"
							}`}
						>
							FAQ
						</Link>
						<Link
							to="/info/whitepaper"
							activeOptions={{ exact: true }}
							className="px-4 py-2 rounded-md transition-all duration-200 text-tabsheading font-roboto-condensed"
							activeProps={{
								className: "bg-gray-800 text-brightyellow",
							}}
							inactiveProps={{
								className: "text-gray-400 hover:text-gray-200",
							}}
						>
							WHITEPAPER
						</Link>
						<Link
							to="/info/audit"
							activeOptions={{ exact: true }}
							className="px-4 py-2 rounded-md transition-all duration-200 text-tabsheading font-roboto-condensed"
							activeProps={{
								className: "bg-gray-800 text-brightyellow",
							}}
							inactiveProps={{
								className: "text-gray-400 hover:text-gray-200",
							}}
						>
							AUDIT
						</Link>
					</div>
				</div>

				<div className="bg-balancebox rounded-lg p-6">
					<Outlet />
				</div>
			</div>
		</div>
	);
}

export default InfoLayout;
