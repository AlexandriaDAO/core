import React from "react";
import { Server } from "lucide-react";

const NoWallet = () => (
	<div className="flex flex-col justify-between gap-2 items-center">
		<div className="p-4 border border-border rounded-full">
			<Server size={40} className="text-gray-500" strokeWidth={1.5} />
		</div>

		<span className="font-roboto-condensed font-bold text-base">
			No wallets created
		</span>
	</div>
);

export default NoWallet;
