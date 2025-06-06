import React from "react";
import { UserActor, AssetManagerActor } from "@/actors";

const ActorProvider = ({ children }: { children: React.ReactNode }) => {
	return (
		<UserActor>
			<AssetManagerActor>
				{children}
			</AssetManagerActor>
		</UserActor>
	);
};

export default ActorProvider;