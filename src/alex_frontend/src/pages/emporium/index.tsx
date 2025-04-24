import React from "react";
import { Link } from "react-router";

const Imporium = () => {
    return (
        <div className="p-4 flex flex-col gap-4">
            <Link to="/app/imporium/nfts">My Nfts</Link>
            <Link to="/app/imporium/listings">My Listings</Link>
            <Link to="/app/imporium/marketplace">Marketplace</Link>
        </div>
    )
};

export default Imporium;
