import React from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
import WalletsPage from "./../../../../pages/librarian/WalletsPage";
import Protected from "@/guards/Protected";

export const Route = createLazyFileRoute("/_auth/dashboard/_librarian/wallets")(
	{
		component: () => (
			<Protected
				unauthorizedComponent={
					<div className="p-4 text-center">
						<p className="text-lg font-semibold">
							Experimental Feature
						</p>
						<p className="mt-2 text-sm text-gray-600">
							This is an experimental VetKey feature to provide
							Arweave Wallet Private Keys to be used in-app. If
							you'd like to participate in adding a wallet as a
							volunteer, please ask an admin.
						</p>
					</div>
				}
			>
				<WalletsPage />
			</Protected>
		),
	}
);
