import React from "react";
import { Link, Outlet } from "@tanstack/react-router";

const tabs = [
	{ to: "/app/sonora", label: "Browse", exact: true },
	{ to: "/app/sonora/record", label: "Record" },
	{ to: "/app/sonora/archive", label: "Archive" },
	{ to: "/app/sonora/studio", label: "Studio" },
	{ to: "/app/sonora/market", label: "Market" },
] as const;

const tabClass = "px-6 py-2 rounded-bordertb font-medium text-tabsheading transition-colors duration-200";
const activeProps = { className: "bg-primary text-primary-foreground shadow-md" };
const inactiveProps = { className: "bg-transparent text-muted-foreground hover:bg-muted hover:text-primary" };

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
						{tabs.map((tab) => (
							<Link
								key={tab.to}
								to={tab.to}
								className={tabClass}
								activeProps={activeProps}
								inactiveProps={inactiveProps}
								{...("exact" in tab && tab.exact ? { activeOptions: { exact: true } } : {})}
							>
								{tab.label}
							</Link>
						))}
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
