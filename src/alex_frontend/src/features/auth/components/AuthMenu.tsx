import React from "react";

import {
	LayoutDashboard,
	LoaderCircle,
	LogOut,
	Settings,
	User,
} from "lucide-react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/lib/components/dropdown-menu";
import { NavLink } from "react-router-dom";
import { useLogout } from "@/hooks/useLogout";
import { useAppSelector } from "@/store/hooks/useAppSelector";

export default function AuthMenu() {
	const logout = useLogout();

	const {user} = useAppSelector(state=>state.auth)

	// show user avatar image if available
	// fallback to username first letter capital

	// const user ={
	// 	username: 'fonso',
	// 	avatar: 'https://picsum.photos/200/200'
	// }
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				{user?.avatar ? (
					<div className="w-[42px] h-[42px] border border-white rounded-full cursor-pointer overflow-hidden">
						<div className="w-full h-full relative">
							<div className="absolute inset-0 flex items-center justify-center">
								<LoaderCircle color="white" size={18} className="animate animate-spin"/>
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
									(e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
								}}
							/>
							<div className="hidden w-full h-full bg-primary items-center justify-center text-white text-xl font-medium">
								{user.username.charAt(0).toUpperCase()}
							</div>
						</div>
					</div>
				) : (
					<div className="w-[42px] h-[42px] border border-white rounded-full cursor-pointer bg-primary flex items-center justify-center">
						<span className="text-white text-xl font-medium">
							{user?.username.charAt(0).toUpperCase()}
						</span>
					</div>
				)}
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-40" side="bottom" align="end">
				<DropdownMenuLabel className="text-center">@{user?.username}</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<NavLink to='/dashboard'>
						<DropdownMenuItem className="cursor-pointer">
							<LayoutDashboard />
							<span>Dashboard</span>
						</DropdownMenuItem>
					</NavLink>
					<NavLink to='/dashboard/profile'>
					<DropdownMenuItem className="cursor-pointer">
						<User />
						<span>Profile</span>
					</DropdownMenuItem>
					</NavLink>
					<NavLink to='/dashboard/settings'>
						<DropdownMenuItem className="cursor-pointer">
							<Settings />
							<span>Settings</span>
						</DropdownMenuItem>
					</NavLink>

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
