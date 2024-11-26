import React from "react";
import ComposeProviders from "@/utils/ComposeProviders";
import {
	AlexBackendActor,
	AlexActor,
	AlexWalletActor,
	IcpLedgerActor,
	IcpSwapActor,
	Icrc7Actor,
	LbryActor,
	NftManagerActor,
	TokenomicsActor,
	VetkdActor,
	UserActor,
} from "@/actors";

interface ActorProviderProps {
	children: React.ReactNode;
}

const ActorProvider: React.FC<ActorProviderProps> = ({ children }) => {
	return (
		<ComposeProviders
			providers={[
				AlexBackendActor,
				AlexActor,
				AlexWalletActor,
				IcpLedgerActor,
				IcpSwapActor,
				Icrc7Actor,
				LbryActor,
				NftManagerActor,
				TokenomicsActor,
				VetkdActor,
				UserActor,
			]}
			>
			{children}
		</ComposeProviders>
	);
};

export default ActorProvider;
