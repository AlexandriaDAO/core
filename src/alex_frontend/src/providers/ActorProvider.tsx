import React from "react";
import ComposeProviders from "@/utils/ComposeProviders";
import {
	NftManagerActor,
	UserActor,
	AlexWalletActor,
	AssetManagerActor,
	VetkdActor,
	PerpetuaActor,
	EmporiumActor,
	AlexActor,
	AlexBackendActor,
	IcpLedgerActor,
	IcpSwapActor,
	Icrc7Actor,
	Icrc7ScionActor,
	LbryActor,
	TokenomicsActor,
	IcpSwapFactoryActor,
	LogsActor,
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
				AssetManagerActor,
				IcpLedgerActor,
				IcpSwapActor,
				Icrc7Actor,
				Icrc7ScionActor,
				LbryActor,
				NftManagerActor,
				TokenomicsActor,
				VetkdActor,
				UserActor,
				AlexWalletActor,
				PerpetuaActor,
				EmporiumActor,
				IcpSwapFactoryActor,
				LogsActor
			]}
			>
			{children}
		</ComposeProviders>
	);
};

export default ActorProvider;