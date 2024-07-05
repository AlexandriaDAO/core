import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ReduxProvider from "./providers/ReduxProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { KeysProvider } from "./contexts/KeysContext";

import Layout from "./pages/Layout";
import HomePage from "./pages/HomePage";
import "./styles/tailwind.css";
import BookPortalPage from "./pages/BookPortalPage";
import ManagerPage from "./pages/ManagerPage";
import ArWeavePage from "./pages/ArWeave";
import SessionProvider from "./providers/SessionProvider";
import ReaderPage from "./pages/ReaderPage";

export default function App() {
    return (
        <ReduxProvider>
            <SessionProvider>
                <BrowserRouter>
                    <AuthProvider>
                            <Routes>
                                <Route path="*" element={<Layout />} />
                                <Route path="/" element={<HomePage />} />
                                <Route path="/book-portal" element={<BookPortalPage />} />
                                <Route path="/manager" element={<ManagerPage />} />
                                <Route path="/reader" element={<ReaderPage />} />
                                <Route
                                    path="/arweave"
                                    element={
                                        <KeysProvider>
                                            <ArWeavePage />
                                        </KeysProvider>
                                    }
                                />
                            </Routes>
                    </AuthProvider>
                </BrowserRouter>
            </SessionProvider>
        </ReduxProvider>
    );
}