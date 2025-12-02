import React from "react";
import { Boxes, Home, LayoutList, LogOut, Settings, User } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useLogout } from "@/hooks/useLogout";

const DashboardSidebar = () => {
	const logout = useLogout();

	return (
		<div className="flex flex-col justify-between p-4">
			<div className="flex flex-col gap-8">
				<div className="flex flex-col gap-3">
					<Link
						to="/dashboard"
						activeOptions={{ exact: true }}
						activeProps={{
							className: "text-primary-foreground bg-primary",
						}}
						inactiveProps={{
							className:
								"text-primary/75 bg-muted hover:border-border hover:text-primary",
						}}
						className="px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all border border-border/75"
					>
						<Home size={18} />
						<span>Home</span>
					</Link>

					<Link
						to="/dashboard/wallets"
						activeOptions={{ exact: true }}
						activeProps={{
							className: "text-primary-foreground bg-primary",
						}}
						inactiveProps={{
							className:
								"text-primary/75 bg-muted hover:border-border hover:text-primary",
						}}
						className="px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all border border-border/75"
					>
						<LayoutList size={18} />
						<span>My Wallets</span>
					</Link>

					<Link
						to="/dashboard/arweave-assets"
						activeOptions={{ exact: true }}
						activeProps={{
							className: "text-primary-foreground bg-primary",
						}}
						inactiveProps={{
							className:
								"text-primary/75 bg-muted hover:border-border hover:text-primary",
						}}
						className="px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all border border-border/75"
					>
						<Boxes size={18} />
						<span>Arweave Assets</span>
					</Link>

					<Link
						to="/dashboard/icp-assets"
						activeOptions={{ exact: true }}
						activeProps={{
							className: "text-primary-foreground bg-primary",
						}}
						inactiveProps={{
							className:
								"text-primary/75 bg-muted hover:border-border hover:text-primary",
						}}
						className="px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all border border-border/75"
					>
						<Boxes size={18} />
						<span>ICP Assets</span>
					</Link>
				</div>
			</div>

			<div className="flex flex-col items-start gap-2">
				<Link
					to="/dashboard/profile"
					className="px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all border border-border/75"
					activeProps={{
						className: "text-primary-foreground bg-primary",
					}}
					inactiveProps={{
						className:
							"text-primary/75 bg-muted hover:border-border hover:text-primary",
					}}
				>
					<User size={18} />
					<span>Profile</span>
				</Link>

				<Link
					to="/dashboard/settings"
					className="px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all border border-border/75"
					activeProps={{
						className: "text-primary-foreground bg-primary",
					}}
					inactiveProps={{
						className:
							"text-primary/75 bg-muted hover:border-border hover:text-primary",
					}}
				>
					<Settings size={18} />
					<span>Settings</span>
				</Link>

				<div
					onClick={logout}
					className="cursor-pointer px-4 py-2 rounded-full flex justify-start gap-2 items-center transition-all text-primary/75 bg-muted border border-border/75 hover:text-primary hover:border-border"
				>
					<LogOut size={18} />
					<span>End Session</span>
				</div>
			</div>
		</div>
	);
};

export default DashboardSidebar;
