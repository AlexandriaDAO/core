import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store"; // Import the store
import principal from "@/features/auth/thunks/principal";

interface ReduxProviderProps {
	children: React.ReactNode;
}

const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
	return <Provider store={store}>{children}</Provider>;
};


export default ReduxProvider