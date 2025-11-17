import React from "react";
import { Link, Outlet } from "@tanstack/react-router";

function BibliothecaLayout() {

	return (
		<div className="flex-grow bg-background p-4 grid grid-rows-[auto_auto_1fr] gap-8 min-h-0">
			<div className="flex flex-col">
				<h1 className="text-xxltabsheading font-syne font-bold text-center text-primary">
					Bibliotheca
				</h1>
				<h3 className="text-smtabsheading text-center text-muted-foreground font-roboto-condensed">
					Create, discover and trade book content
				</h3>
			</div>

			<div className="bg-card rounded-bordertb shadow">
				<nav
					className="flex flex-wrap items-center justify-center gap-2 p-2"
					aria-label="Tabs"
				>
					<Link
						to="/app/bibliotheca"
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
						to="/app/bibliotheca/upload"
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
						to="/app/bibliotheca/library"
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
						Library
					</Link>

					<Link
						to="/app/bibliotheca/shelf"
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
						Shelf
					</Link>

					<Link
						to="/app/bibliotheca/market"
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

export default BibliothecaLayout;
