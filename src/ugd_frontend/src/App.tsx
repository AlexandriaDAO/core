import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ReduxProvider from "./store/ReduxProvider";
import { AuthProvider } from "./contexts/AuthContext";

import Layout from "./pages/Layout";
import Home from "./pages/Home";
import "./styles/tailwind.css";
import NotFound from "./pages/NotFound";

export default function App() {
	// const { handleLogin, handleLogout, UID } = useAuth();

	return (
		<ReduxProvider>
			<BrowserRouter>
				<Routes>
					<Route
						path="*"
						element={
							<AuthProvider>
								<Layout />
							</AuthProvider>
						}
					/>
					<Route path="/" element={<Home />} />
				</Routes>
			</BrowserRouter>
		</ReduxProvider>
	);
}
