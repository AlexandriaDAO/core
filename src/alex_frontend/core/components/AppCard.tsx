import React from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

import { App } from "./../config/apps"; // Import from the new location

interface AppCardProps {
	app: App;
	size?: "default" | "small";
	className?: string; // Allow passing additional classes
}

const AppCard: React.FC<AppCardProps> = ({
	app,
	size = "default",
	className,
}) => {
	const isSmall = size === "small";
	const isComingSoon = app.comingSoon ?? false;

	const cardContent = (
		<div
			className={cn(
				"w-full p-2 rounded-2xl flex flex-col items-center justify-center gap-1.5",
				"transition-all duration-300 shadow-md dark:shadow-lg group",
				isComingSoon
					? "dark:bg-gray-850 bg-gray-100 cursor-not-allowed opacity-70"
					: [
							"dark:bg-gray-800 bg-gray-50 cursor-pointer opacity-100",
							"hover:shadow-xl dark:hover:shadow-2xl",
							"hover:bg-gray-100 dark:hover:bg-gray-700",
						].join(" "),
				isSmall ? "min-h-[100px]" : "min-h-[140px]", // Adjust min height for small
				className // Apply additional classes
			)}
		>
			<div
				className={cn(
					"flex items-center justify-center m-1 transition-transform duration-300",
					isSmall
						? "w-12 h-12"
						: "w-[100px] md:w-[120px] h-[100px] md:h-[120px]", // Adjust size for small/default/mobile isn't handled here yet
					!isComingSoon && "group-hover:scale-110"
				)}
			>
				{isComingSoon ? (
					<div className="text-[#848484] font-syne text-xs font-semibold text-center">
						COMING
						<br />
						SOON
					</div>
				) : (
					app.logo && (
						<img
							src={app.logo}
							alt={`${app.name} logo`}
							className="w-full h-full object-contain p-1 transition-transform duration-300" // Slightly less padding
						/>
					)
				)}
			</div>
			<div
				className={cn(
					"font-syne font-bold text-center",
					"text-foreground transition-colors duration-300",
					isSmall ? "text-xs" : "text-sm md:text-lg" // Adjust text size
				)}
			>
				{app.name}
			</div>
			{!isSmall && ( // Only show description on default size
				<div
					className={cn(
						"font-poppins font-normal text-center",
						"text-muted-foreground transition-colors duration-300",
						"text-xs md:text-sm"
					)}
				>
					{app.description}
				</div>
			)}
		</div>
	);

	return (
		<Link
			to={isComingSoon ? "#" : app.path}
			className="no-underline w-full"
			onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
				isComingSoon && e.preventDefault()
			}
		>
			{cardContent}
		</Link>
	);
};

export default AppCard;
