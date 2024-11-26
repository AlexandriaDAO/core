import React from "react";
import IIProvider from "./IIProvider";

interface AuthenticationProviderProps {
	children: React.ReactNode;
}

const AuthenticationProvider: React.FC<AuthenticationProviderProps> = ({ children }) => {
	return (
		<IIProvider >
			{children}
		</IIProvider>
	)
}


export default AuthenticationProvider