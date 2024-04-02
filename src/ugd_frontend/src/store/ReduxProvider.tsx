import React, { useRef } from "react";
import { Provider } from "react-redux";
import { AppStore } from "./storeTypes";
import { makeStore } from ".";
import { initialize } from "@/features/auth/authSlice";

export default function ReduxProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const storeRef = useRef<AppStore>();
	if (!storeRef.current) {
		// Create the store instance the first time this renders
		storeRef.current = makeStore();

		// here we will initialize authentication

		storeRef.current.dispatch(initialize());
	}

	return <Provider store={storeRef.current}>{children}</Provider>;
}
