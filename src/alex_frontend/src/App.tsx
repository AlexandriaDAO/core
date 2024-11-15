import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReduxProvider from "./providers/ReduxProvider";
import RiskWarningModal from "./components/RiskWarningModal";
import { useRiskWarning } from "./hooks/useRiskWarning";

import HomePage from "./pages/HomePage";
import "./styles/tailwind.css";
import ManagerPage from "./pages/ManagerPage";
import SessionProvider from "./providers/SessionProvider";
import SwapPage from "./pages/swap";
import LibrarianPage from "./pages/LibrarianPage";
import WhitepaperPage from "./pages/WhitepaperPage";

import Alexandrian from "./apps/app/Alexandrian";
import Bibliotheca from "./apps/app/Bibliotheca";
import Syllogos from "./apps/app/Syllogos";
import Lexigraph from "./apps/app/Lexigraph";
import Dialectica from "./apps/app/Dialectica";
import Permasearch from "./apps/app/Permasearch";
import Emporium from "./apps/app/Emporium";

import MintPage from "./pages/MintPage";
import CollectionPage from "./apps/app/Emporium/CollectionPage";

import "./styles/style.css";
import DetailTransaction from "./features/swap/components/transactionHistory/detailTransaction";

export default function App() {
    const { showRiskWarning, handleCloseRiskWarning } = useRiskWarning();

    return (
        <ReduxProvider>
            <SessionProvider>
                <BrowserRouter>
                    {showRiskWarning && <RiskWarningModal onClose={handleCloseRiskWarning} open={showRiskWarning} />}
                    <Routes>
                        {/* <Route path="*" element={<Layout />} /> */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/manager" element={<ManagerPage />} />
                        <Route path="/swap" element={<SwapPage />} />
                        <Route path="/swap/transaction" element={<DetailTransaction />} />

                        <Route path="/librarian" element={<LibrarianPage />} />
                        <Route path="/whitepaper" element={<WhitepaperPage />} />

                        {/* App routes */}
                        <Route path="/app/bibliotheca" element={<Bibliotheca />} />
                        <Route path="/app/alexandrian" element={<Alexandrian />} />
                        <Route path="/app/syllogos" element={<Syllogos />} />
                        <Route path="/app/lexigraph" element={<Lexigraph />} />
                        <Route path="/app/dialectica" element={<Dialectica />} />
                        <Route path="/app/permasearch" element={<Permasearch />} />
                        <Route path="/app/emporium" element={<Emporium />} />

                        {/* Theke (/theke) - from Greek "θήκη" meaning repository or case */}
                        {/* Pinax (/pinax) - from Greek "πίναξ" meaning register or catalog */}
                        {/* Theke (/theke) - from Greek "θήκη" meaning repository or case */}

                        {/* A place to display user nfts */}
                        <Route path="/app/emporium/collection" element={<CollectionPage />} />

                        {/* experimental/temporary */}
                        <Route path="/mint" element={<MintPage />} />
                    </Routes>
                </BrowserRouter>
            </SessionProvider>
        </ReduxProvider>
    );
}