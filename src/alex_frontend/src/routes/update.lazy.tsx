import React from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/update")({
	component: UpdatePage,
});

function UpdatePage() {
	return (
		<div className="p-10 flex-grow flex flex-col gap-4 justify-center items-start">
			<Link className="hover:text-info dark:text-info-foreground dark:hover:text-info" to="/exchange">Exchange {"("}/exchange{") (Auth Required)"}</Link>
			<div className="flex flex-col gap-1 ml-4">
				<Link className="hover:text-info dark:text-info-foreground dark:hover:text-info" to="/exchange/insights">Exchange/Insights {"("}/exchange/insights{")"}</Link>
				<Link className="hover:text-info dark:text-info-foreground dark:hover:text-info" to="/exchange/redeem">Exchange/Redeem {"("}/exchange/redeem{")"}</Link>
				<Link className="hover:text-info dark:text-info-foreground dark:hover:text-info" to="/exchange/stake">Exchange/Stake {"("}/exchange/stake{")"}</Link>
				<Link className="hover:text-info dark:text-info-foreground dark:hover:text-info" to="/exchange/history">Exchange/History {"("}/exchange/history{")"}</Link>
				<Link className="hover:text-info dark:text-info-foreground dark:hover:text-info" to="/exchange/burn">Exchange/Burn {"("}/exchange/burn{") (Auth Required)"}</Link>
			</div>
		</div>
	)
}