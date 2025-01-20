import React, { lazy, Suspense } from "react";

import { createBrowserRouter, RouterProvider } from "react-router";

import BaseLayout from "@/layouts/BaseLayout";
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";

import HomePage from "@/pages/HomePage";

// import DashboardLayout from "@/layouts/DashboardLayout";
// const DashboardLayout = lazy(()=> wait(0).then(()=>import("@/layouts/DashboardLayout")))
import NotFoundPage from "@/pages/NotFoundPage";
import UpgradePage from "@/pages/dashboard/UpgradePage";
import LibrarianLayout from "@/layouts/LibrarianLayout";
import LibrarianPage from "@/pages/librarian/";
import NodesPage from "@/pages/librarian/NodesPage";
// import UploadPage from "@/pages/dashboard/UploadPage";
import InsightsPage from "@/pages/swap/insightsPage";

import ManagerPage from "@/pages/ManagerPage";
import LegacyLibrarianPage from "@/pages/LegacyLibrarianPage";
import WhitepaperPage from "@/pages/WhitepaperPage";
import Bibliotheca from "@/apps/app/Bibliotheca";
import Alexandrian from "@/apps/app/Alexandrian";
import Syllogos from "@/apps/app/Syllogos";
import Lexigraph from "@/apps/app/Lexigraph";
import Dialectica from "@/apps/app/Dialectica";
import Permasearch from "@/apps/app/Permasearch";
import Emporium from "@/apps/app/Emporium";
import LegacyCollectionPage from "@/apps/app/Emporium/CollectionPage";
import SwapPage from "@/pages/swap";
import DetailTransaction from "@/features/swap/components/transactionHistory/detailTransaction";
import MintPage from "@/pages/MintPage";
import DashboardPage from "@/pages/dashboard";
import ProfilePage from "@/pages/dashboard/ProfilePage";
import EnginesPage from "@/pages/dashboard/EnginesPage";
import EngineOverviewPage from "@/pages/dashboard/EngineOverviewPage";
import PublicEnginesPage from "@/pages/dashboard/PublicEnginesPage";
// import AssetsPage from "@/pages/dashboard/AssetsPage";
// import CollectionPage from "@/pages/dashboard/CollectionPage";
import MainPageSkeleton from "@/layouts/skeletons/MainPageSkeleton";
import { wait } from "@/utils/lazyLoad";
import LayoutSkeleton from "@/layouts/skeletons/LayoutSkeleton";

export const AppRoutes = () => {
	const router = createBrowserRouter([
		{
			element: <BaseLayout />,
			children: [
				{
					path: "/",
					element: <MainLayout />,
					children: [
						{ index: true, element: <HomePage /> },
						{ path: "manager", element: <ManagerPage /> },
						{
							path: "legacy_librarian",
							element: <LegacyLibrarianPage />,
						},
						{ path: "whitepaper", element: <WhitepaperPage /> },
						{
							path: "app",
							children: [
								{
									path: "bibliotheca",
									element: <Bibliotheca />,
								},
								{
									path: "alexandrian",
									element: <Alexandrian />,
								},
								{ path: "syllogos", element: <Syllogos /> },
								{ path: "lexigraph", element: <Lexigraph /> },
								{ path: "dialectica", element: <Dialectica /> },
								{
									path: "permasearch",
									element: <Permasearch />,
								},
								{
									path: "emporium",
									children: [
										{ index: true, element: <Emporium /> },
										{
											path: "collection",
											element: <LegacyCollectionPage />,
										},
									],
								},
							],
						},
						{
							path: "swap",
							children: [
								{ index: true, element: <SwapPage /> },
								{
									path: "transaction",
									element: <DetailTransaction />,
								},
								{ path: "insights", element: <InsightsPage /> },
							],
						},
						{ path: "mint", element: <MintPage /> },
						{ path: "*", element: <NotFoundPage /> },
					],
				},
				{
					element: <AuthLayout />,
					children: [
						{
							path: "dashboard",
							// element: <Suspense fallback={<DashboardLayoutSkeleton />}>
							// 	<DashboardLayout />
							// </Suspense>,
							lazy: ()=>wait(0).then(()=>import('@/layouts/DashboardLayout').then(module=>({
								Component: module.default
							}))),
							children: [
								{
									index: true,
									// element: <DashboardPage />,
									// lazy: () => import("@/pages/dashboard").then(module => ({
									// 	Component: module.default,
									// })),
									lazy: () => wait(2000).then(()=> import("@/pages/dashboard").then(module => ({
										Component: module.default,
									}))),
								},
								{
									path: "profile",
									children: [
										{
											index: true,
											lazy: () => wait(2000).then(()=>import("@/pages/dashboard/ProfilePage").then(module => ({
												Component: module.default,
											}))),
										},
										{
											path: "upgrade",
											// element: <UpgradePage />,
											lazy: () => wait(2000).then(()=>import("@/pages/dashboard/UpgradePage").then(module => ({
												Component: module.default,
											}))),
										},
									],
								},
								{
									path: "engines",
									children: [
										{
											index: true,
											// element: <EnginesPage />,
											lazy: () => wait(2000).then(()=>import("@/pages/dashboard/EnginesPage").then(module => ({
												Component: module.default,
											}))),
										},
										{
											path: ":id",
											// element: <EngineOverviewPage />,
											lazy: () => wait(2000).then(()=>import("@/pages/dashboard/EngineOverviewPage").then(module => ({
												Component: module.default,
											}))),
										},
										{
											path: "public",
											// element: <PublicEnginesPage />,
											lazy: () => wait(2000).then(()=>import("@/pages/dashboard/PublicEnginesPage").then(module => ({
												Component: module.default,
											}))),
										},
									],
								},
								{
									path: "assets",
									children: [
										{
											index: true,
											// element: <AssetsPage />,
											lazy: () => wait(2000).then(()=>import("@/pages/dashboard/AssetsPage").then(module => ({
												Component: module.default,
											}))),
										},
										{
											path: "upload",
											// element: <UploadPage />,
											lazy: () => wait(2000).then(()=>import("@/pages/dashboard/UploadPage").then(module => ({
												Component: module.default,
											}))),
										},
									],
								},
								{
									path: "collection",
									lazy: () => wait(2000).then(()=>import("@/pages/dashboard/CollectionPage").then(module => ({
										Component: module.default,
									}))),

									// lazy: async () => {
									// 	console.log('waiting');
									// 	await wait(2000);
									// 	console.log('waiting done');
									// 	console.log("lazy loading");
									// 	const module = await import("@/pages/dashboard/CollectionPage");
									// 	console.log("lazy loading done");
									// 	return {
									// 		Component: module.default,
									// 		// loading: <MainPageSkeleton />,
									// 		// hydrateFallback: <MainPageSkeleton />,
									// 		// HydrateFallback: <MainPageSkeleton />,

									// 	};
									// },
								},
							],
						},
						{
							path: "librarian",
							element: <LibrarianLayout />,
							children: [
								{ index: true, element: <LibrarianPage /> },
								{ path: "nodes", element: <NodesPage /> },
								{ path: "profile", element: <ProfilePage /> },
							],
						},
					],
				},
			],
		},
	]);

	return <RouterProvider router={router} />;
};
