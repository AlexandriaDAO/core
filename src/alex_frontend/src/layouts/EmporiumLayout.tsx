import React from "react";
import { Link, Outlet } from "@tanstack/react-router";

function EmporiumLayout() {

	return (
		<div className="bg-background p-4 flex flex-col flex-grow gap-8">
			<div className="flex flex-col">
				<h1 className="text-xxltabsheading font-syne font-bold text-center text-primary">Emporium</h1>
				<h3 className="text-smtabsheading text-center text-muted-foreground font-roboto-condensed">Discover, Trade, and Track Your Digital Assets</h3>
			</div>
			<div className="bg-card rounded-bordertb shadow">
				<nav className="flex justify-center gap-2 p-2" aria-label="Tabs">
					<Link
						to="/app/emporium"
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
						Marketplace
					</Link>

					{/* <Link
						to="/app/imporium/nfts"
						className="px-6 py-2 rounded-bordertb font-medium text-tabsheading transition-colors duration-200"
						activeProps={{
							className: "bg-primary text-primary-foreground shadow-md"
						}}
						inactiveProps={{
							className: "bg-transparent text-muted-foreground hover:bg-muted hover:text-primary"
						}}
					>
						My NFTs
					</Link> */}

					<Link
						to="/app/emporium/my-logs"
						className="px-6 py-2 rounded-bordertb font-medium text-tabsheading transition-colors duration-200"
						activeProps={{
							className: "bg-primary text-primary-foreground shadow-md"
						}}
						inactiveProps={{
							className: "bg-transparent text-muted-foreground hover:bg-muted hover:text-primary"
						}}
					>
						My Logs
					</Link>

					<Link
						to="/app/emporium/market-logs"
						className="px-6 py-2 rounded-bordertb font-medium text-tabsheading transition-colors duration-200"
						activeProps={{
							className: "bg-primary text-primary-foreground shadow-md"
						}}
						inactiveProps={{
							className: "bg-transparent text-muted-foreground hover:bg-muted hover:text-primary"
						}}
					>
						Market Logs
					</Link>
				</nav>
			</div>
			<div className="place-content-center place-items-center">
				<Outlet />
			</div>
		</div>
	);
}

export default EmporiumLayout;