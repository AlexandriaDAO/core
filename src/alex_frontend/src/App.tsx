import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ReduxProvider from "./providers/ReduxProvider";
import { AuthProvider } from "./contexts/AuthContext";

import Layout from "./pages/Layout";
import HomePage from "./pages/HomePage";
import "../public/tailwind.css";
import BookPortalPage from "./pages/BookPortalPage";
import ManagerPage from "./pages/ManagerPage";
import SessionProvider from "./providers/SessionProvider";
import FundNodePage from "./pages/FundNodePage";
import SwapPage from "./pages/swap";
import LibrarianPage from "./pages/LibrarianPage";

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
                                <Route path="/fund-node" element={<FundNodePage />} />
                                <Route path="/swap" element={<SwapPage />} />
                                <Route path="/librarian" element={<LibrarianPage />} />
                            </Routes>
                    </AuthProvider>
                </BrowserRouter>
            </SessionProvider>
        </ReduxProvider>
    );
}