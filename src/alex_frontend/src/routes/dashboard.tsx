import DashboardPage from "@/pages/dashboard";
import AssetsPage from "@/pages/dashboard/AssetsPage";
import CollectionPage from "@/pages/dashboard/CollectionPage";
import EnginesPage from "@/pages/dashboard/EnginesPage";
import ProfilePage from "@/pages/dashboard/ProfilePage";
import EngineOverviewPage from "@/pages/dashboard/EngineOverviewPage";
import React from "react";
import PublicEnginesPage from "@/pages/dashboard/PublicEnginesPage";

export const dashboardRoutes = [
    { path: "/dashboard", element: <DashboardPage /> },
    { path: "/dashboard/profile", element: <ProfilePage /> },
    { path: "/dashboard/engines/:id", element: <EngineOverviewPage /> },
    { path: "/dashboard/engines", element: <EnginesPage /> },
    { path: "/dashboard/engines/public", element: <PublicEnginesPage /> },
    { path: "/dashboard/assets", element: <AssetsPage /> },
    { path: "/dashboard/collection", element: <CollectionPage /> },
];