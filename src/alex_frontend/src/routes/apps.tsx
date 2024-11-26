import React from "react";

import Bibliotheca from "../apps/app/Bibliotheca";
import Alexandrian from "../apps/app/Alexandrian";
import Syllogos from "../apps/app/Syllogos";
import Lexigraph from "../apps/app/Lexigraph";
import Dialectica from "../apps/app/Dialectica";
import Permasearch from "../apps/app/Permasearch";
import Emporium from "../apps/app/Emporium";
import CollectionPage from "../apps/app/Emporium/CollectionPage";

export const appRoutes = [
    { path: "/app/bibliotheca", element: <Bibliotheca /> },
    { path: "/app/alexandrian", element: <Alexandrian /> },
    { path: "/app/syllogos", element: <Syllogos /> },
    { path: "/app/lexigraph", element: <Lexigraph /> },
    { path: "/app/dialectica", element: <Dialectica /> },
    { path: "/app/permasearch", element: <Permasearch /> },
    { path: "/app/emporium", element: <Emporium /> },
    { path: "/app/emporium/collection", element: <CollectionPage /> },
];