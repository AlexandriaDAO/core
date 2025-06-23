import React, { lazy, Suspense } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Skeleton } from "@/lib/components/skeleton";
import ExchangePageSkeleton from "@/components/skeletons/ExchangePageSkeleton";

const AccountPanel = lazy(() => import("@/features/account/Panel"));
const BalancePanel = lazy(() => import("@/features/balance/Panel"));

function ExchangeLayout() {
    const {user} = useAppSelector(state=>state.auth)
    const {isLoading} = useRouterState()
	return (
        <div className='flex-grow p-4 flex flex-col gap-4'>
            {user ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                        style={{ backgroundImage: 'url("images/gradient-bg.png")' }}
                        className="bg-gray-900 text-white p-6 rounded-3xl">
                        <Suspense fallback={
                            <div className="flex flex-col gap-6 font-roboto-condensed">
                                {/* Header Section */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="w-12 h-12 rounded-full" />
                                        <div className="flex flex-col gap-2">
                                            <Skeleton className="h-6 w-24" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-8 w-28" />
                                </div>

                                {/* Address Sections */}
                                <div className="space-y-4">
                                    <div className="group">
                                        <div className="flex items-center justify-between mb-2">
                                            <Skeleton className="h-4 w-20" />
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-6 w-6" />
                                                <Skeleton className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-12 w-full rounded-lg" />
                                    </div>

                                    <div className="group">
                                        <div className="flex items-center justify-between mb-2">
                                            <Skeleton className="h-4 w-20" />
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-6 w-6" />
                                                <Skeleton className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-12 w-full rounded-lg" />
                                    </div>

                                    {/* Deposit Info Section */}
                                    <Skeleton className="h-16 w-full rounded-lg" />
                                </div>
                            </div>
                        }>
                            <AccountPanel />
                        </Suspense>
                    </div>
                    <div
                        style={{ backgroundImage: 'url("images/gradient-bg.png")' }}
                        className="bg-gray-900 text-white p-6 rounded-3xl">
                        <Suspense fallback={
                            <div className="h-full flex flex-col justify-between font-roboto-condensed">
                                {/* Portfolio Header */}
                                <div className="group">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                        <Skeleton className="h-8 w-20" />
                                    </div>
                                    
                                    {/* Available Balances */}
                                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 space-y-2 mb-4">
                                        <div className="flex justify-between items-center p-2">
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="w-6 h-6 rounded-full" />
                                                <Skeleton className="h-4 w-20" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-4 w-16" />
                                                <div className="flex gap-1">
                                                    <Skeleton className="w-4 h-4" />
                                                    <Skeleton className="w-4 h-4" />
                                                    <Skeleton className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center p-2">
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="w-6 h-6 rounded-full" />
                                                <Skeleton className="h-4 w-20" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-4 w-16" />
                                                <div className="flex gap-1">
                                                    <Skeleton className="w-4 h-4" />
                                                    <Skeleton className="w-4 h-4" />
                                                    <Skeleton className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center p-2">
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="w-6 h-6 rounded-full" />
                                                <Skeleton className="h-4 w-20" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-4 w-16" />
                                                <div className="flex gap-1">
                                                    <Skeleton className="w-4 h-4" />
                                                    <Skeleton className="w-4 h-4" />
                                                    <Skeleton className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Topup Wallet */}
                                    <div className="group">
                                        <div className="flex items-center justify-between mb-2">
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                        <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 space-y-2">
                                            <div className="flex justify-between items-center p-2">
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="w-4 h-4" />
                                                    <Skeleton className="h-4 w-16" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="h-4 w-16" />
                                                    <div className="flex gap-1">
                                                        <Skeleton className="w-4 h-4" />
                                                        <Skeleton className="w-4 h-4" />
                                                        <Skeleton className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center p-2">
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="w-4 h-4" />
                                                    <Skeleton className="h-4 w-16" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="h-4 w-16" />
                                                    <div className="flex gap-1">
                                                        <Skeleton className="w-4 h-4" />
                                                        <Skeleton className="w-4 h-4" />
                                                        <Skeleton className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }>
                            <BalancePanel />
                        </Suspense>
                    </div>
                </div>
            ): (
                <div className="flex flex-col">
                    <h1 className="text-xxltabsheading font-syne font-bold text-center text-primary">Swap</h1>
                    <h3 className="text-smtabsheading text-center text-muted-foreground font-roboto-condensed">Effortlessly Manage and Monitor Your Portfolio.</h3>
                    <p className="text-center text-muted-foreground font-roboto-condensed">You can navigate around and check the Application History & Insights. Login to view your balances.</p>
                </div>
            )}
            <div className="bg-card rounded-bordertb shadow">
                <nav className="flex flex-wrap items-center justify-center gap-2 p-2" aria-label="Tabs">
                    {user && <>
                        <Link
                            to="/exchange"
                            className="px-6 py-2 rounded-bordertb font-medium text-tabsheading transition-colors duration-200"
                            activeProps={{
                                className: "bg-primary text-primary-foreground shadow-md"
                            }}
                            inactiveProps={{
                                className: "bg-transparent text-muted-foreground hover:bg-muted hover:text-primary"
                            }}
                            activeOptions={{
                                exact: true
                            }}
                        >
                            Exchange
                        </Link>
                        <Link
                            to="/exchange/burn"
                            className="px-6 py-2 rounded-bordertb font-medium text-tabsheading transition-colors duration-200"
                            activeProps={{
                                className: "bg-primary text-primary-foreground shadow-md"
                            }}
                            inactiveProps={{
                                className: "bg-transparent text-muted-foreground hover:bg-muted hover:text-primary"
                            }}
                            activeOptions={{
                                exact: true
                            }}
                        >
                            Burn
                        </Link>
                        <Link
                            to="/exchange/redeem"
                            className="px-6 py-2 rounded-bordertb font-medium text-tabsheading transition-colors duration-200"
                            activeProps={{
                                className: "bg-primary text-primary-foreground shadow-md"
                            }}
                            inactiveProps={{
                                className: "bg-transparent text-muted-foreground hover:bg-muted hover:text-primary"
                            }}
                            activeOptions={{
                                exact: true
                            }}
                        >
                            Redeem
                        </Link>
                    </>}
                    <Link
                        to="/exchange/stake"
                        className="px-6 py-2 rounded-bordertb font-medium text-tabsheading transition-colors duration-200"
                        activeProps={{
                            className: "bg-primary text-primary-foreground shadow-md"
                        }}
                        inactiveProps={{
                            className: "bg-transparent text-muted-foreground hover:bg-muted hover:text-primary"
                        }}
                        activeOptions={{
                            exact: true
                        }}
                    >
                        Staking
                    </Link>
                    <Link
                        to="/exchange/history"
                        className="px-6 py-2 rounded-bordertb font-medium text-tabsheading transition-colors duration-200"
                        activeProps={{
                            className: "bg-primary text-primary-foreground shadow-md"
                        }}
                        inactiveProps={{
                            className: "bg-transparent text-muted-foreground hover:bg-muted hover:text-primary"
                        }}
                    >
                        History
                    </Link>
                    <Link
                        to="/exchange/insights"
                        className="px-6 py-2 rounded-bordertb font-medium text-tabsheading transition-colors duration-200"
                        activeProps={{
                            className: "bg-primary text-primary-foreground shadow-md"
                        }}
                        inactiveProps={{
                            className: "bg-transparent text-muted-foreground hover:bg-muted hover:text-primary"
                        }}
                        activeOptions={{
                            exact: true
                        }}
                    >
                        Insights
                    </Link>
                </nav>
            </div>

            {isLoading ? <ExchangePageSkeleton />: <Outlet />}
            {/* <div className="flex-grow bg-card rounded-bordertb shadow">
            </div> */}
        </div>
	);
};

export default ExchangeLayout;