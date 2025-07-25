import React from "react";
import { Link } from "@tanstack/react-router";

const Imporium = () => {
    return (
        <div className="p-4 flex flex-col gap-4">
            <Link to="/app/imporium/nfts">My Nfts</Link>
            <Link to="/app/imporium/marketplace">Marketplace</Link>
            <Link to="/app/imporium/market-logs">Market Logs</Link>
            <Link to="/app/imporium/my-logs">My Logs</Link>
        </div>
    )
};

export default Imporium;
