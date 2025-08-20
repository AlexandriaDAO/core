import React, { lazy, Suspense } from "react";

import {
	LayoutDashboard,
	LoaderCircle,
	LogOut,
	Settings,
	User,
	Wallet,
	Fingerprint,
	ChevronRight,
} from "lucide-react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
} from "@/lib/components/dropdown-menu";
import { Link } from "@tanstack/react-router";
import { useLogout } from "@/hooks/useLogout";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Copy from "@/components/Copy";

const BalanceDetails = lazy(() => import("../balance/BalanceDetails"));

const Auth = () => {
	const logout = useLogout();

	const {user} = useAppSelector(state=>state.auth);
	const { total } = useAppSelector(state => state.balance)

	return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {user?.avatar ? (
                    <div className="w-[32px] h-[32px] sm:w-[42px] sm:h-[42px] border border-white rounded-full cursor-pointer overflow-hidden">
                        <div className="w-full h-full relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <LoaderCircle color="white" className="w-4 h-4 sm:w-[18px] sm:h-[18px] animate animate-spin"/>
                            </div>
                            <img
                                src={user.avatar}
                                alt={user.username}
                                className="w-full h-full object-cover"
                                onLoad={(e) => {
                                    (e.currentTarget.previousElementSibling as HTMLElement).style.display = 'none';
                                }}
                                onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                    (e.currentTarget.previousElementSibling as HTMLElement).style.display = 'none';
                                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                                }}
                            />
                            <div className="hidden w-full h-full bg-primary items-center justify-center text-white text-base sm:text-xl font-medium">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-[32px] h-[32px] sm:w-[42px] sm:h-[42px] border border-white rounded-full cursor-pointer bg-[#0172A] dark:bg-white flex items-center justify-center">
                        <span className="text-base sm:text-xl text-white dark:text-[#0F172A] font-medium">
                            {user?.username.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 sm:w-40" side="bottom" align="end">
                <DropdownMenuLabel className="text-center">@{user?.username}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Mobile only - Balance and Principal */}
                <div className="sm:hidden">
                    <DropdownMenuGroup>
                        {/* Balance with submenu */}
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="cursor-pointer">
                                <Wallet className="mr-2 h-4 w-4" />
                                <div className="flex-1 flex justify-between items-center">
                                    <span className="text-sm">Balance</span>
                                    <span className="text-sm font-medium">
                                        {total > 0 ? `$${total.toFixed(2)}` : "$0.00"}
                                    </span>
                                </div>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-56">
                                <Suspense fallback={
                                    <div className="p-2">
                                        <div className="h-8 bg-gray-200 animate-pulse rounded mb-2"></div>
                                        <div className="h-8 bg-gray-200 animate-pulse rounded mb-2"></div>
                                        <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
                                    </div>
                                }>
                                    <BalanceDetails />
                                </Suspense>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        
                        {/* ID with copy */}
                        <DropdownMenuItem className="cursor-default">
                            <Fingerprint className="mr-2 h-4 w-4" />
                            <div className="flex-1 flex justify-between items-center">
                                <span className="text-sm">ID</span>
                                <div className="flex items-center gap-1">
                                    <img alt="IC" className="inline-block w-3 h-3" src="/images/ic.svg" />
                                    <span className="text-sm font-medium">
                                        {user?.principal.slice(0, 4) + "..." + user?.principal.slice(-3)}
                                    </span>
                                    <Copy text={user?.principal || ""} size="sm" />
                                </div>
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                </div>
                
                    <DropdownMenuGroup>
                        <Link to='/dashboard'>
                            <DropdownMenuItem className="cursor-pointer">
                                <LayoutDashboard />
                                <span>Dashboard</span>
                            </DropdownMenuItem>
                        </Link>
                        <Link to='/dashboard/profile'>
                            <DropdownMenuItem className="cursor-pointer">
                                <User />
                                <span>Profile</span>
                            </DropdownMenuItem>
                        </Link>
                        <Link to='/dashboard/settings'>
                            <DropdownMenuItem className="cursor-pointer">
                                <Settings />
                                <span>Settings</span>
                            </DropdownMenuItem>
                        </Link>
                    </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={logout}>
                    <LogOut />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
	);
}

export default Auth;