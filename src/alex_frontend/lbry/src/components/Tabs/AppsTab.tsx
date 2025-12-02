import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LayoutGrid } from "lucide-react";
import { appsData, App } from "@/config/apps";
import NavMenu from "./NavMenu";

export const AppsTab: React.FC = () => {
	const navigate = useNavigate();
	const [isHovered, setIsHovered] = useState(false);

	const activeApps = appsData.filter((app: App) => !app.comingSoon);

	return (
		<div
			className="relative group"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<NavMenu path="/" label="APPS" />

			<div
				className={`
                    absolute top-full left-1/2 transform -translate-x-1/2 w-[200px]
                    bg-gray-900 border border-gray-800 rounded-md shadow-lg z-10
                    transition-all duration-300 origin-top
                    ${
						isHovered
							? "opacity-100 scale-y-100"
							: "opacity-0 scale-y-0 pointer-events-none"
					}`}
			>
				<div className="p-1.5">
					{activeApps.map((app: App) => (
						<div
							key={app.name}
							className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-800 rounded"
							onClick={() => {
								navigate({ to: app.path });
								setIsHovered(false);
							}}
						>
							{app.logo && (
								<img
									src={app.logo}
									alt={`${app.name} logo`}
									className="w-5 h-5 object-contain"
								/>
							)}
							<div className="flex flex-col">
								<span className="text-white text-sm font-syne">
									{app.name}
								</span>
								<span className="text-gray-400 text-xs">
									{app.description}
								</span>
							</div>
						</div>
					))}
					<div className="h-px bg-gray-800 my-1"></div>
					<div
						className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-800 rounded"
						onClick={() => {
							navigate({ to: "/" });
							setIsHovered(false);
						}}
					>
						<LayoutGrid className="w-5 h-5 text-gray-400" />
						<span className="text-white text-sm font-syne">
							View All Apps
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};
