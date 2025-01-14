import React, { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router";

import TopProgressBar from "@/components/TopProgressBar";
import { lazyLoad } from "@/utils/lazyLoad";

const BaseLayout = lazyLoad(() => import("@/layouts/BaseLayout"));
const MainLayout = lazyLoad(() => import("@/layouts/MainLayout"));
const AuthLayout = lazyLoad(() => import("@/layouts/AuthLayout"));
const HomePage = lazyLoad(() => import("@/pages/HomePage"));


const DashboardLayout = lazyLoad(() => import("@/layouts/DashboardLayout"));
const NotFoundPage = lazyLoad(() => import("@/pages/NotFoundPage"));
const UpgradePage = lazyLoad(() => import("@/pages/dashboard/UpgradePage"));
const LibrarianLayout = lazyLoad(() => import("@/layouts/LibrarianLayout"));
const LibrarianPage = lazyLoad(() => import("@/pages/librarian/"));
const NodesPage = lazyLoad(() => import("@/pages/librarian/NodesPage"));
const UploadPage = lazyLoad(() => import("@/pages/dashboard/UploadPage"));
const InsightsPage = lazyLoad(() => import("@/pages/swap/insightsPage"));

const ManagerPage = lazyLoad(() => import("@/pages/ManagerPage"));
const LegacyLibrarianPage = lazyLoad(() => import("@/pages/LegacyLibrarianPage"));
const WhitepaperPage = lazyLoad(() => import("@/pages/WhitepaperPage"));
const Bibliotheca = lazyLoad(() => import("@/apps/app/Bibliotheca"));
const Alexandrian = lazyLoad(() => import("@/apps/app/Alexandrian"));
const Syllogos = lazyLoad(() => import("@/apps/app/Syllogos"));
const Lexigraph = lazyLoad(() => import("@/apps/app/Lexigraph"));
const Dialectica = lazyLoad(() => import("@/apps/app/Dialectica"));
const Permasearch = lazyLoad(() => import("@/apps/app/Permasearch"));
const Emporium = lazyLoad(() => import("@/apps/app/Emporium"));
const LegacyCollectionPage = lazyLoad(() => import("@/apps/app/Emporium/CollectionPage"));
const SwapPage = lazyLoad(() => import("@/pages/swap"));
const DetailTransaction = lazyLoad(() => import("@/features/swap/components/transactionHistory/detailTransaction"));
const MintPage = lazyLoad(() => import("@/pages/MintPage"));
const DashboardPage = lazyLoad(() => import("@/pages/dashboard"));
const ProfilePage = lazyLoad(() => import("@/pages/dashboard/ProfilePage"));
const EnginesPage = lazyLoad(() => import("@/pages/dashboard/EnginesPage"));
const EngineOverviewPage = lazyLoad(() => import("@/pages/dashboard/EngineOverviewPage"));
const PublicEnginesPage = lazyLoad(() => import("@/pages/dashboard/PublicEnginesPage"));
const AssetsPage = lazyLoad(() => import("@/pages/dashboard/AssetsPage"));
const CollectionPage = lazyLoad(() => import("@/pages/dashboard/CollectionPage"));

export const AppRoutes = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<BaseLayout />}>
					<Route path="/" element={<MainLayout />}>
						<Route index element={<Suspense fallback={<TopProgressBar />}><HomePage /></Suspense>} />
						<Route path="manager" element={<Suspense fallback={<TopProgressBar />}><ManagerPage /></Suspense>} />
						<Route path="legacy_librarian" element={<Suspense fallback={<TopProgressBar />}><LegacyLibrarianPage /></Suspense>} />
						<Route path="whitepaper" element={<Suspense fallback={<TopProgressBar />}><WhitepaperPage /></Suspense>} />

						<Route path="app">
							<Route path="bibliotheca" element={<Suspense fallback={<TopProgressBar />}><Bibliotheca /></Suspense>} />
							<Route path="alexandrian" element={<Suspense fallback={<TopProgressBar />}><Alexandrian /></Suspense>} />
							<Route path="syllogos" element={<Suspense fallback={<TopProgressBar />}><Syllogos /></Suspense>} />
							<Route path="lexigraph" element={<Suspense fallback={<TopProgressBar />}><Lexigraph /></Suspense>} />
							<Route path="dialectica" element={<Suspense fallback={<TopProgressBar />}><Dialectica /></Suspense>} />
							<Route path="permasearch" element={<Suspense fallback={<TopProgressBar />}><Permasearch /></Suspense>} />

							<Route path="emporium">
								<Route index element={<Suspense fallback={<TopProgressBar />}><Emporium /></Suspense>} />
								<Route
									path="collection"
									element={<Suspense fallback={<TopProgressBar />}><LegacyCollectionPage /></Suspense>}
								/>
							</Route>
						</Route>
						<Route path="swap">
							<Route index element={<Suspense fallback={<TopProgressBar />}><SwapPage /></Suspense>} />
							<Route path="transaction" element={<Suspense fallback={<TopProgressBar />}><DetailTransaction /></Suspense>} />
							<Route path="insights" element={<Suspense fallback={<TopProgressBar />}><InsightsPage /></Suspense>} />
						</Route>
						<Route path="mint" element={<Suspense fallback={<TopProgressBar />}><MintPage /></Suspense>} />

						<Route path="*" element={<Suspense fallback={<TopProgressBar />}><NotFoundPage /></Suspense>} />
					</Route>
					<Route element={<Suspense fallback={<TopProgressBar />}><AuthLayout /></Suspense>}>
						<Route path="dashboard" element={<Suspense fallback={<TopProgressBar />}><DashboardLayout /></Suspense>}>
							<Route index element={<Suspense fallback={<TopProgressBar />}><DashboardPage /></Suspense>} />
							{/* <Route path="profile" element={<ProfilePage />} /> */}
							<Route path="profile">
								<Route index element={<Suspense fallback={<TopProgressBar />}><ProfilePage /></Suspense>} />
								<Route path="upgrade" element={<Suspense fallback={<TopProgressBar />}><UpgradePage /></Suspense>} />
							</Route>

							<Route path="engines">
								<Route index element={<Suspense fallback={<TopProgressBar />}><EnginesPage /></Suspense>} />
								<Route path=":id" element={<Suspense fallback={<TopProgressBar />}><EngineOverviewPage /></Suspense>} />
								<Route path="public" element={<Suspense fallback={<TopProgressBar />}><PublicEnginesPage /></Suspense>} />
							</Route>
							<Route path="assets">
								<Route index element={<Suspense fallback={<TopProgressBar />}><AssetsPage /></Suspense>} />
								<Route path="upload" element={<Suspense fallback={<TopProgressBar />}><UploadPage /></Suspense>} />
							</Route>
							<Route path="collection" element={<Suspense fallback={<TopProgressBar />}><CollectionPage /></Suspense>} />
						</Route>

						<Route path="librarian" element={<Suspense fallback={<TopProgressBar />}><LibrarianLayout /></Suspense>}>
							<Route index element={<Suspense fallback={<TopProgressBar />}><LibrarianPage /></Suspense>} />
							<Route path="nodes" element={<Suspense fallback={<TopProgressBar />}><NodesPage /></Suspense>} />


							<Route path="profile" element={<Suspense fallback={<TopProgressBar />}><ProfilePage /></Suspense>} />
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
