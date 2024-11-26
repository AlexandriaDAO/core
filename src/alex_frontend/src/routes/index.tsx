import React from 'react';

import { mainRoutes } from './main';
import { dashboardRoutes } from './dashboard';
import { appRoutes } from './apps';
import { swapRoutes } from './swap';
import { experimentalRoutes } from './experimental';
import NotFoundPage from '@/pages/NotFoundPage';

export interface RouteConfig {
    path: string;
    element: React.ReactNode;
}

export const routes: RouteConfig[] = [
    ...mainRoutes,
    ...dashboardRoutes,
    ...appRoutes,
    ...swapRoutes,
    ...experimentalRoutes,

    { path: "/*", element: <NotFoundPage /> },
];