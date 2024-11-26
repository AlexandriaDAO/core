import React from "react";

import HomePage from "@/pages/HomePage";
import LibrarianPage from "@/pages/LibrarianPage";
import ManagerPage from "@/pages/ManagerPage";
import WhitepaperPage from "@/pages/WhitepaperPage";

export const mainRoutes = [
    { path: "/", element: <HomePage /> },
    { path: "/manager", element: <ManagerPage /> },
    { path: "/librarian", element: <LibrarianPage /> },
    { path: "/whitepaper", element: <WhitepaperPage /> },
];