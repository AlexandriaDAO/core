import React, { lazy, Suspense, useMemo } from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import TopProgressBar from "@/components/TopProgressBar";
import BaseLayout from "@/layouts/BaseLayout";
import MainLayout from "@/layouts/MainLayout";
import AuthGuard from "@/guards/AuthGuard";
import Protected from "@/guards/Protected";
import LibrarianGuard from "@/guards/LibrarianGuard";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ROUTES } from "./routeConfig";

// Common loading fallback to reduce duplication
const defaultFallback = <TopProgressBar />;

// Optimized lazy loading without artificial delays
const lazyLoad = <T extends React.ComponentType<any>>(
	importFn: () => Promise<{ default: T }>
) => lazy(importFn);

// Critical path components - not lazy loaded
import HomePage from "@/pages/HomePage";
import SingleTokenView from "@/apps/Modules/AppModules/blinks/SingleTokenView";
import ManagerPage from "@/pages/ManagerPage";

// Non-critical components - lazy loaded
const NotFoundPage = lazyLoad(() => import("@/pages/NotFoundPage"));
const UpgradePage = lazyLoad(() => import("@/pages/dashboard/UpgradePage"));
const LibrarianPage = lazyLoad(() => import("@/pages/librarian/"));
const WalletsPage = lazyLoad(() => import("@/pages/librarian/WalletsPage"));
const AssetSyncPage = lazyLoad(() => import("@/pages/dashboard/AssetSyncPage"));
const PinaxPage = lazyLoad(() => import("@/pages/PinaxPage"));
const InfoPage = lazyLoad(() => import("@/pages/InfoPage"));
const DashboardLayout = lazyLoad(() => import("@/layouts/DashboardLayout"));
const UnauthorizedPage = lazyLoad(() => import("@/pages/UnauthorizedPage"));
const ProfilePage = lazyLoad(() => import("@/pages/dashboard/ProfilePage"));
const LayoutSkeleton = lazyLoad(
	() => import("@/layouts/skeletons/LayoutSkeleton")
);
const MainPageSkeleton = lazyLoad(
	() => import("@/layouts/skeletons/MainPageSkeleton")
);

// App module imports - grouped by feature
const AppModules = {
	Bibliotheca: lazyLoad(() => import("@/apps/app/Bibliotheca")),
	Alexandrian: lazyLoad(() => import("@/apps/app/Alexandrian")),
	Syllogos: lazyLoad(() => import("@/apps/app/Syllogos")),
	Perpetua: lazyLoad(() => import("@/apps/app/Perpetua")),
	Dialectica: lazyLoad(() => import("@/apps/app/Dialectica")),
	Permasearch: lazyLoad(() => import("@/apps/app/Permasearch")),
	Emporium: lazyLoad(() => import("@/apps/app/Emporium")),
};

// Swap feature - group related components
const SwapFeature = {
	SwapPage: lazyLoad(() => import("@/pages/swap")),
	DetailTransaction: lazyLoad(
		() =>
			import(
				"@/features/swap/components/transactionHistory/detailTransaction"
			)
	),
};

// Actors - optimized to remove artificial delay
const Actors = {
	AlexWalletActor: lazyLoad(() =>
		import("@/actors").then((module) => ({
			default: module.AlexWalletActor,
		}))
	),
	NftManagerActor: lazyLoad(() =>
		import("@/actors").then((module) => ({
			default: module.NftManagerActor,
		}))
	),
};

// Component with actors for Pinax page
const PinaxWithActors = () => (
	<Suspense fallback={<div>Loading components...</div>}>
		<Actors.AlexWalletActor>
			<Actors.NftManagerActor>
				<PinaxPage />
			</Actors.NftManagerActor>
		</Actors.AlexWalletActor>
	</Suspense>
);

// Component with actors for Wallets page
const WalletsWithActors = () => (
	<Suspense fallback={<div>Loading wallet...</div>}>
		<Actors.AlexWalletActor>
			<WalletsPage />
		</Actors.AlexWalletActor>
	</Suspense>
);

// Split route definitions into logical groups for better organization and code splitting
const mainRoutes = [
	{
		path: ROUTES.HOME,
		element: <MainLayout />,
		children: [
			{ index: true, element: <HomePage /> },
			{ path: ROUTES.NFT, element: <SingleTokenView /> },
			{ path: ROUTES.MANAGER, element: <ManagerPage /> },
			{
				path: ROUTES.UNAUTHORIZED,
				element: (
					<Suspense fallback={defaultFallback}>
						<UnauthorizedPage />
					</Suspense>
				),
			},
			{
				path: ROUTES.NOT_FOUND,
				element: (
					<Suspense fallback={defaultFallback}>
						<NotFoundPage />
					</Suspense>
				),
			},

			// Fixed infoRoutes - added element property
			{
				path: ROUTES.INFO,
				element: <Outlet />, // This is the fix - adding an element that renders children
				children: [
					{
						index: true,
						element: (
							<Suspense fallback={defaultFallback}>
								<InfoPage />
							</Suspense>
						),
					},
					{
						path: "faq",
						element: (
							<Suspense fallback={defaultFallback}>
								<InfoPage />
							</Suspense>
						),
					},
					{
						path: "whitepaper",
						element: (
							<Suspense fallback={defaultFallback}>
								<InfoPage />
							</Suspense>
						),
					},
					{
						path: "audit",
						element: (
							<Suspense fallback={defaultFallback}>
								<InfoPage />
							</Suspense>
						),
					},
				],
			},

			// Fixed appRoutes - added element property
			{
				path: "app",
				element: <Outlet />, // This is the fix - adding an element that renders children
				children: [
					{
						path: "bibliotheca",
						element: (
							<Suspense fallback={defaultFallback}>
								<AppModules.Bibliotheca />
							</Suspense>
						),
					},
					{
						path: "alexandrian",
						element: (
							<Suspense fallback={defaultFallback}>
								<AppModules.Alexandrian />
							</Suspense>
						),
					},
					{
						path: "syllogos",
						element: (
							<Suspense fallback={defaultFallback}>
								<AppModules.Syllogos />
							</Suspense>
						),
					},
					{
						path: "perpetua",
						element: (
							<Suspense fallback={defaultFallback}>
								<AppModules.Perpetua />
							</Suspense>
						),
						children: [
							{ index: true, element: <Outlet /> },
							{ path: "my-library", element: <Outlet /> },
							{
								path: "my-library/shelf/:shelfId",
								element: <Outlet />,
							},
							{
								path: "my-library/item/:itemId",
								element: <Outlet />,
							},
							{ path: "explore", element: <Outlet /> },
							{
								path: "explore/shelf/:shelfId",
								element: <Outlet />,
							},
							{
								path: "explore/item/:itemId",
								element: <Outlet />,
							},
							{ path: "user/:userId", element: <Outlet /> },
							{
								path: "user/:userId/shelf/:shelfId",
								element: <Outlet />,
							},
							{
								path: "user/:userId/item/:itemId",
								element: <Outlet />,
							},
						],
					},
					{
						path: "dialectica",
						element: (
							<Suspense fallback={defaultFallback}>
								<AppModules.Dialectica />
							</Suspense>
						),
					},
					{
						path: "permasearch",
						element: (
							<Suspense fallback={defaultFallback}>
								<AppModules.Permasearch />
							</Suspense>
						),
					},
					{
						path: "emporium",
						element: (
							<Suspense fallback={defaultFallback}>
								<AppModules.Emporium />
							</Suspense>
						),
					},
				],
			},

			// Fixed swapRoutes - added element property
			{
				path: "swap",
				element: <Outlet />, // This is the fix - adding an element that renders children
				children: [
					{
						index: true,
						element: (
							<Suspense fallback={defaultFallback}>
								<SwapFeature.SwapPage />
							</Suspense>
						),
					},
					{
						path: "balance",
						element: (
							<Suspense fallback={defaultFallback}>
								<SwapFeature.SwapPage />
							</Suspense>
						),
					},
					{
						path: "swap",
						element: (
							<Suspense fallback={defaultFallback}>
								<SwapFeature.SwapPage />
							</Suspense>
						),
					},
					{
						path: "topup",
						element: (
							<Suspense fallback={defaultFallback}>
								<SwapFeature.SwapPage />
							</Suspense>
						),
					},
					{
						path: "send",
						element: (
							<Suspense fallback={defaultFallback}>
								<SwapFeature.SwapPage />
							</Suspense>
						),
					},
					{
						path: "receive",
						element: (
							<Suspense fallback={defaultFallback}>
								<SwapFeature.SwapPage />
							</Suspense>
						),
					},
					{
						path: "burn",
						element: (
							<Suspense fallback={defaultFallback}>
								<SwapFeature.SwapPage />
							</Suspense>
						),
					},
					{
						path: "stake",
						element: (
							<Suspense fallback={defaultFallback}>
								<SwapFeature.SwapPage />
							</Suspense>
						),
					},
					{
						path: "redeem",
						element: (
							<Suspense fallback={defaultFallback}>
								<SwapFeature.SwapPage />
							</Suspense>
						),
					},
					{
						path: "history",
						element: (
							<Suspense fallback={defaultFallback}>
								<SwapFeature.SwapPage />
							</Suspense>
						),
					},
					{
						path: "insights",
						element: (
							<Suspense fallback={defaultFallback}>
								<SwapFeature.SwapPage />
							</Suspense>
						),
					},
					{
						path: "transaction",
						element: (
							<Suspense fallback={defaultFallback}>
								<SwapFeature.DetailTransaction />
							</Suspense>
						),
					},
				],
			},
		],
	},
];

const authRoutes = {
	element: <AuthGuard />,
	children: [
		{
			element: <MainLayout />,
			children: [{ path: ROUTES.PINAX, element: <PinaxWithActors /> }],
		},
		{
			element: <Protected />,
			children: [
				{
					path: ROUTES.DASHBOARD_ROUTES.BASE,
					element: (
						<Suspense fallback={<LayoutSkeleton />}>
							<DashboardLayout />
						</Suspense>
					),
					children: [
						{
							element: <LibrarianGuard />,
							children: [
								{
									index: true,
									element: (
										<Suspense
											fallback={<MainPageSkeleton />}
										>
											<LibrarianPage />
										</Suspense>
									),
								},
								{
									path: "wallets",
									element: <WalletsWithActors />,
								},
							],
						},
						{
							path: "asset-sync",
							element: (
								<Suspense fallback={<MainPageSkeleton />}>
									<AssetSyncPage />
								</Suspense>
							),
						},
						{
							path: "profile",
							element: <Outlet />, // Added element property
							children: [
								{
									index: true,
									element: (
										<Suspense
											fallback={<MainPageSkeleton />}
										>
											<ProfilePage />
										</Suspense>
									),
								},
								{
									path: "upgrade",
									element: (
										<Suspense
											fallback={<MainPageSkeleton />}
										>
											<UpgradePage />
										</Suspense>
									),
								},
							],
						},
					],
				},
			],
		},
	],
};

// Create the final router with optimized structure
const router = createBrowserRouter([
	{
		path: "/",
		element: (
			<ErrorBoundary>
				<BaseLayout />
			</ErrorBoundary>
		),
		children: [...mainRoutes, authRoutes],
	},
]);

// Memoize the router to prevent unnecessary recreation
export const AppRoutes = () => {
	const memoizedRouter = useMemo(() => router, []);
	return <RouterProvider router={memoizedRouter} />;
};