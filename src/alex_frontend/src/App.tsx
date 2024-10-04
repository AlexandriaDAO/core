import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReduxProvider from "./providers/ReduxProvider";

import HomePage from "./pages/HomePage";
import "../public/tailwind.css";
import ManagerPage from "./pages/ManagerPage";
import SessionProvider from "./providers/SessionProvider";
import SwapPage from "./pages/swap";
import LibrarianPage from "./pages/LibrarianPage";
import WhitepaperPage from "./pages/WhitepaperPage";

import Bibliotheca from "./apps/app/Bibliotheca";
import Syllogos from "./apps/app/Syllogos";
import Lexigraph from "./apps/app/Lexigraph";
import Dialectica from "./apps/app/Dialectica";
import Permasearch from "./apps/app/Permasearch";
import Emporium from "./apps/app/Emporium";

import MintPage from "./pages/MintPage";

export default function App() {
    return (
        <ReduxProvider>
            <SessionProvider>
                <BrowserRouter>
                    <Routes>
                        {/* <Route path="*" element={<Layout />} /> */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/manager" element={<ManagerPage />} />
                        <Route path="/swap" element={<SwapPage />} />
                        <Route path="/librarian" element={<LibrarianPage />} />
                        <Route path="/whitepaper" element={<WhitepaperPage />} />

                        {/* App routes */}
                        <Route path="/app/bibliotheca" element={<Bibliotheca />} />
                        <Route path="/app/syllogos" element={<Syllogos />} />
                        <Route path="/app/lexigraph" element={<Lexigraph />} />
                        <Route path="/app/dialectica" element={<Dialectica />} />
                        <Route path="/app/permasearch" element={<Permasearch />} />
                        <Route path="/app/emporium" element={<Emporium />} />

                        {/* experimental/temporary */}
                        <Route path="/mint" element={<MintPage />} />
                    </Routes>
                </BrowserRouter>
            </SessionProvider>
        </ReduxProvider>
    );
}