import React from "react";
import { UserActor, AssetManagerActor, IcpSwapFactoryActor } from "@/actors";

const ActorProvider = ({ children }: { children: React.ReactNode }) => {
	return (
		<UserActor>
			<AssetManagerActor>
				<IcpSwapFactoryActor>
					{children}
				</IcpSwapFactoryActor>
			</AssetManagerActor>
		</UserActor>
	);
};

export default ActorProvider;