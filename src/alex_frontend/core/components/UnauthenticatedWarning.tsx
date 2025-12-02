import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { UserX } from "lucide-react";
import { Alert } from "./Alert";

export function UnauthenticatedWarning() {
	const { user } = useAppSelector((state) => state.auth);

	if(!user) return (
		<Alert
			variant="warning"
			className="w-full"
			title="Sign in to access features"
			icon={UserX}
		>
			You need to be signed in to mint NFTs and access other features.
		</Alert>
	);
}