import React from "react";
import { Link, Outlet } from "@tanstack/react-router";

function SonoraLayout() {
	return (
		<>
			<div className="bg-background p-4 flex flex-col gap-8">
				<div className="flex flex-col">
					<h1 className="text-xxltabsheading font-syne font-bold text-center text-primary">Sonora</h1>
					<h3 className="text-smtabsheading text-center text-muted-foreground font-roboto-condensed">Discover, Record, and Trade Audio NFTs</h3>
				</div>
				<div className="bg-card rounded-bordertb shadow">
					<nav className="flex justify-center gap-2 p-2" aria-label="Tabs">
						<Link
							to="/app/sonora"
							className="px-6 py-2 rounded-bordertb font-medium text-tabsheading transition-colors duration-200"
							activeProps={{
								className: "bg-primary text-primary-foreground shadow-md"
							}}
							inactiveProps={{
								className: "bg-transparent text-muted-foreground hover:bg-muted hover:text-primary"
							}}
							activeOptions={{
								exact: true
							}}
						>
							Browse
						</Link>

						<Link
							to="/app/sonora/record"
							className="px-6 py-2 rounded-bordertb font-medium text-tabsheading transition-colors duration-200"
							activeProps={{
								className: "bg-primary text-primary-foreground shadow-md"
							}}
							inactiveProps={{
								className: "bg-transparent text-muted-foreground hover:bg-muted hover:text-primary"
							}}
						>
							Record
						</Link>

						<Link
							to="/app/sonora/archive"
							className="px-6 py-2 rounded-bordertb font-medium text-tabsheading transition-colors duration-200"
							activeProps={{
								className: "bg-primary text-primary-foreground shadow-md"
							}}
							inactiveProps={{
								className: "bg-transparent text-muted-foreground hover:bg-muted hover:text-primary"
							}}
						>
							Collection
						</Link>

						<Link
							to="/app/sonora/market"
							className="px-6 py-2 rounded-bordertb font-medium text-tabsheading transition-colors duration-200"
							activeProps={{
								className: "bg-primary text-primary-foreground shadow-md"
							}}
							inactiveProps={{
								className: "bg-transparent text-muted-foreground hover:bg-muted hover:text-primary"
							}}
						>
							Shop
						</Link>
					</nav>
				</div>
			</div>
			<main className="flex-1 p-6">
				<Outlet />
			</main>
		</>
	);
}

export default SonoraLayout;
