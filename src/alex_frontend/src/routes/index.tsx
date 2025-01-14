import HomePage from "../pages/HomePage";
import ManagerPage from "../pages/ManagerPage";
import LegacyLibrarianPage from "../pages/LegacyLibrarianPage";
import WhitepaperPage from "../pages/WhitepaperPage";
import Bibliotheca from "../apps/app/Bibliotheca";
import Alexandrian from "../apps/app/Alexandrian";
import Syllogos from "../apps/app/Syllogos";
import Lexigraph from "../apps/app/Lexigraph";
import Dialectica from "../apps/app/Dialectica";
import Permasearch from "../apps/app/Permasearch";
import Emporium from "../apps/app/Emporium";
import LegacyCollectionPage from "../apps/app/Emporium/CollectionPage";
import SwapPage from "../pages/swap";
import DetailTransaction from "../features/swap/components/transactionHistory/detailTransaction";
import MintPage from "../pages/MintPage";
import DashboardPage from "../pages/dashboard";
import ProfilePage from "../pages/dashboard/ProfilePage";
import EnginesPage from "../pages/dashboard/EnginesPage";
import EngineOverviewPage from "../pages/dashboard/EngineOverviewPage";
import PublicEnginesPage from "../pages/dashboard/PublicEnginesPage";
import AssetsPage from "../pages/dashboard/AssetsPage";
import CollectionPage from "../pages/dashboard/CollectionPage";
import RequestsMonitor from "../resources/RequestsMonitor";

import React from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import BaseLayout from "../layouts/BaseLayout";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import NotFoundPage from "@/pages/NotFoundPage";
import UpgradePage from "@/pages/dashboard/UpgradePage";
import LibrarianLayout from "@/layouts/LibrarianLayout";
import LibrarianPage from "@/pages/librarian/";
import NodesPage from "@/pages/librarian/NodesPage";
import UploadPage from "@/pages/dashboard/UploadPage";
import InsightsPage from "@/pages/swap/insightsPage";

export const AppRoutes = () => {
	return (
        <BrowserRouter>
            <Routes>
                <Route element={<BaseLayout />}>
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<HomePage />} />
                        <Route path="manager" element={<ManagerPage />} />
                        <Route path="legacy_librarian" element={<LegacyLibrarianPage />} />
                        <Route path="whitepaper" element={<WhitepaperPage />} />

                        <Route path="app">
                            <Route path="bibliotheca" element={<Bibliotheca />} />
                            <Route path="alexandrian" element={<Alexandrian />} />
                            <Route path="syllogos" element={<Syllogos />} />
                            <Route path="lexigraph" element={<Lexigraph />} />
                            <Route path="dialectica" element={<Dialectica />} />
                            <Route path="permasearch" element={<Permasearch />} />

                            <Route path="emporium">
                                <Route index element={<Emporium />} />
                                <Route
                                    path="collection"
                                    element={<LegacyCollectionPage />}
                                />
                            </Route>
                        </Route>
                        <Route path="swap">
                            <Route index element={<SwapPage />} />
                            <Route path="transaction" element={<DetailTransaction />} />
                            <Route path="insights" element={<InsightsPage />} />
                        </Route>
                        <Route path="mint" element={<MintPage />} />

                        <Route path="*" element={<NotFoundPage />} />
                    </Route>
                    <Route element={<AuthLayout />}>
                        <Route path="dashboard" element={<DashboardLayout />}>
                            <Route index element={<DashboardPage />} />
                            {/* <Route path="profile" element={<ProfilePage />} /> */}
                            <Route path="profile">
                                <Route index element={<ProfilePage />} />
                                <Route path="upgrade" element={<UpgradePage />} />
                            </Route>

                            <Route path="engines">
                                <Route index element={<EnginesPage />} />
                                <Route path=":id" element={<EngineOverviewPage />} />
                                <Route path="public" element={<PublicEnginesPage />} />
                            </Route>
                            <Route path="assets">
                                <Route index element={<AssetsPage />} />
                                <Route path="upload" element={<UploadPage />} />
                            </Route>
                            <Route path="collection" element={<CollectionPage />} />
                            <Route path="monitor" element={<RequestsMonitor />} />
                        </Route>

                        <Route path="librarian" element={<LibrarianLayout />}>
                            <Route index element={<LibrarianPage />} />
                            <Route path="nodes" element={<NodesPage />} />


                            <Route path="profile" element={<ProfilePage />} />
                            {/* <Route path="profile">
                                <Route index element={<ProfilePage />} />
                                <Route path="upgrade" element={<UpgradePage />} />
                            </Route>

                            <Route path="engines">
                                <Route index element={<EnginesPage />} />
                                <Route path=":id" element={<EngineOverviewPage />} />
                                <Route path="public" element={<PublicEnginesPage />} />
                            </Route>
                            <Route path="assets" element={<AssetsPage />} />
                            <Route path="collection" element={<CollectionPage />} /> */}
                        </Route>

                        

                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
	);
};
