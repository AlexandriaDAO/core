import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/lib/components/button";
import { ShoppingBag } from "lucide-react";
import { NavLink } from "react-router-dom";
import Collection from "@/features/collection";

function CollectionPage() {

	return (
		<DashboardLayout
			title="My Collection"
			description="list of your minted NFTs"
			action={(
				<NavLink to="/app/emporium/">
					<Button variant='link' scale="sm" className="flex justify-between gap-2 items-center">
						<ShoppingBag size={18}/>
						<span>Visit Shop Page</span>
					</Button>
				</NavLink>
			)}
		>
			<Collection />
		</DashboardLayout>
	);
}

export default CollectionPage;