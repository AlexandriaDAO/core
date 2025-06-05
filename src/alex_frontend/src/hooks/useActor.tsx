import { useContext } from "react";
import ActorContext from "@/contexts/ActorContext";

export function useActor() {
	const context = useContext(ActorContext);

	if (!context) {
		throw new Error("useActor must be used within an ActorProvider");
	}

	return context;
}