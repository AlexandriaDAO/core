import React from "react";
import { UserActor, AssetManagerActor, IcpSwapFactoryActor, OrbitStationActor } from "@/actors";

const ActorProvider = ({ children }: { children: React.ReactNode }) => {
	return (
		<UserActor>
			<AssetManagerActor>
				<IcpSwapFactoryActor>
					<OrbitStationActor>
						{children}
					</OrbitStationActor>
				</IcpSwapFactoryActor>
			</AssetManagerActor>
		</UserActor>
	);
};

export default ActorProvider;