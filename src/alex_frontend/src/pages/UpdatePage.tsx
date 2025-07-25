import { Link } from "@tanstack/react-router";
import React from "react";

function UpdatePage() {

	return (
		<div className="p-10 flex-grow flex flex-col gap-4 justify-center items-start">
			<Link className="hover:text-info dark:text-info-foreground dark:hover:text-info" to="/app/alexis">Alexandrian {"("}/app/alexis{")"}</Link>
			<Link className="hover:text-info dark:text-info-foreground dark:hover:text-info" to="/app/permafind">PermaSearch {"("}/app/permafind{")"}</Link>
			<Link className="hover:text-info dark:text-info-foreground dark:hover:text-info" to="/app/imporium">Emporium {"("}/app/imporium{")"}</Link>
			<div className="flex flex-col gap-1 ml-4">
				<Link className="hover:text-info dark:text-info-foreground dark:hover:text-info" to="/app/imporium/nfts">Emporium/My Nfts  {"("}/app/imporium/nfts{") (Auth Required)"}</Link>
				<Link className="hover:text-info dark:text-info-foreground dark:hover:text-info" to="/app/imporium/marketplace">Emporium/Marketplace  {"("}/app/imporium/marketplace{") (Auth Required)"}</Link>
				<Link className="hover:text-info dark:text-info-foreground dark:hover:text-info" to="/app/imporium/my-logs">Emporium/My Logs  {"("}/app/imporium/my-logs{") (Auth Required)"}</Link>
				<Link className="hover:text-info dark:text-info-foreground dark:hover:text-info" to="/app/imporium/market-logs">Emporium/Market Logs  {"("}/app/imporium/market-logs{") (Auth Required)"}</Link>
			</div>

			<Link className="hover:text-info dark:text-info-foreground dark:hover:text-info" to="/exchange">Exchange {"("}/exchange{") (Auth Required)"}</Link>
			<div className="flex flex-col gap-1 ml-4">
				<Link className="hover:text-info dark:text-info-foreground dark:hover:text-info" to="/exchange/insights">Exchange/Insights {"("}/exchange/insights{")"}</Link>
				<Link className="hover:text-info dark:text-info-foreground dark:hover:text-info" to="/exchange/redeem">Exchange/Redeem {"("}/exchange/redeem{")"}</Link>
				<Link className="hover:text-info dark:text-info-foreground dark:hover:text-info" to="/exchange/stake">Exchange/Stake {"("}/exchange/stake{")"}</Link>
				<Link className="hover:text-info dark:text-info-foreground dark:hover:text-info" to="/exchange/history">Exchange/History {"("}/exchange/history{")"}</Link>
				<Link className="hover:text-info dark:text-info-foreground dark:hover:text-info" to="/exchange/burn">Exchange/Burn {"("}/exchange/burn{") (Auth Required)"}</Link>
			</div>
		</div>
	);
}

export default UpdatePage;