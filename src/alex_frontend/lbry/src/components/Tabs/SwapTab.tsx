import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
	LayoutGrid,
	Flame,
	RotateCcw,
	CoinsIcon,
	History,
	LineChart,
	Lock,
} from "lucide-react";
import NavMenu from "./NavMenu";

// Non-authentication required pages
const publicExchangePages = {
	redeem: RotateCcw,
	stake: CoinsIcon,
	history: History,
	insights: LineChart,
} as const;

// Authentication-required pages
const authSwapPages = {
	burn: Flame,
} as const;

export const SwapTab: React.FC = () => {
	const navigate = useNavigate();
	const [isHovered, setIsHovered] = useState(false);

	return (
		<div
			className="relative group"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<NavMenu path="/swap" label="SWAP" />

			<div
				className={`
                    absolute top-full left-1/2 transform -translate-x-1/2 w-[220px]
                    bg-gray-900 border border-gray-800 rounded-md shadow-lg z-10
                    transition-all duration-300 origin-top
                    ${
						isHovered
							? "opacity-100 scale-y-100"
							: "opacity-0 scale-y-0 pointer-events-none"
					}
                `}
			>
				<div className="p-1.5">
					{/* Public pages (no authentication required) */}
					{Object.entries(publicExchangePages).map(([path, Icon]) => {
						const displayName =
							path.charAt(0).toUpperCase() + path.slice(1);

						return (
							<div
								key={path}
								className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-800 rounded"
								onClick={() => {
									navigate({ to: `/swap/${path}` });
									setIsHovered(false);
								}}
							>
								<Icon className="w-5 h-5 text-gray-400" />
								<span className="text-white text-sm font-syne">
									{displayName}
								</span>
							</div>
						);
					})}

					{/* Horizontal divider */}
					<div className="h-px bg-gray-800 my-1"></div>

					{/* Auth-required pages with lock icons */}
					{Object.entries(authSwapPages).map(([path, Icon]) => {
						const displayName =
							path.charAt(0).toUpperCase() + path.slice(1);
						const route = `/swap/${path}`;

						return (
							<div
								key={path}
								className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-800 rounded"
								onClick={() => {
									navigate({ to: route });
									setIsHovered(false);
								}}
							>
								<Lock className="w-4 h-4 text-yellow-500" />
								<Icon className="w-5 h-5 text-gray-400" />
								<span className="text-white text-sm font-syne">
									{displayName}
								</span>
							</div>
						);
					})}

					<div className="h-px bg-gray-800 my-1"></div>
					<div
						className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-800 rounded"
						onClick={() => {
							navigate({ to: "/swap" });
							setIsHovered(false);
						}}
					>
						<LayoutGrid className="w-5 h-5 text-gray-400" />
						<span className="text-white text-sm font-syne">
							View All Options
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};
