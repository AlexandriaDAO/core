import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ReduxProvider from "./providers/ReduxProvider";
import { AuthProvider } from "./contexts/AuthContext";

import Layout from "./pages/Layout";
import HomePage from "./pages/HomePage";
import "./styles/tailwind.css";
import BookPortalPage from "./pages/BookPortalPage";
import ManagerPage from "./pages/ManagerPage";
import ArWeavePage from "./pages/ArWeave";
import SessionProvider from "./providers/SessionProvider";

export default function App() {
	return (
		<ReduxProvider>
			<SessionProvider>
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
						<Route path="/" element={<HomePage />} />
						<Route path="/book-portal" element={<BookPortalPage />} />
						<Route path="/manager" element={<ManagerPage />} />
						<Route
							path="/arweave"
							element={
								<AuthProvider>
									<ArWeavePage />
								</AuthProvider>
							}
						/>
					</Routes>
				</BrowserRouter>
			</SessionProvider>
		</ReduxProvider>
	);
}
