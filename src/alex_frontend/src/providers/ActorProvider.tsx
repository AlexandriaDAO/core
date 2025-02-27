import React from "react";
import ComposeProviders from "@/utils/ComposeProviders";
import {
	// AlexBackendActor,
	// AlexActor,
	// IcpLedgerActor,
	// IcpSwapActor,
	// Icrc7Actor,
	// Icrc7ScionActor,
	// LbryActor,
	NftManagerActor,
	// TokenomicsActor,
	// VetkdActor,
	UserActor,
} from "@/actors";

interface ActorProviderProps {
	children: React.ReactNode;
}

const ActorProvider: React.FC<ActorProviderProps> = ({ children }) => {
	return (
		<ComposeProviders
			providers={[
				// AlexBackendActor,
				// AlexActor,
				// IcpLedgerActor,
				// IcpSwapActor,
				// Icrc7Actor,
				// Icrc7ScionActor,
				// LbryActor,
				NftManagerActor,
				// TokenomicsActor,
				// VetkdActor,
				UserActor,
			]}
			>
			{children}
		</ComposeProviders>
	);
};

export default ActorProvider;
