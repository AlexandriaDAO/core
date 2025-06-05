import { useContext } from "react";
import ActorContext from "@/contexts/ActorContext";

export function useIdentity() {
	const context = useContext(ActorContext);

	if (!context) {
		throw new Error("useIdentity must be used within an ActorProvider");
	}

	return {
        identity: context.identity,
        isInitializing: context.isInitializing,
        isLoggingIn: context.isLoggingIn,
        clear: context.clear,
        login: context.login
    };
}