import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "src/ucg_frontend/src/store"; // Import the store
import principal from "src/ucg_frontend/src/features/auth/thunks/principal";

interface ReduxProviderProps {
	children: React.ReactNode;
}

const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
	return <Provider store={store}>{children}</Provider>;
};


export default ReduxProvider