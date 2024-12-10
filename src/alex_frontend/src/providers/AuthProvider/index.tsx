import React from "react";
import IIProvider from "./IIProvider";

interface AuthProviderProps {
	children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	return (
		<IIProvider >
			{children}
		</IIProvider>
	)
}


export default AuthProvider