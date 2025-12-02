import React, { useState, useEffect, lazy, Suspense } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { cn } from "@/lib/utils";
import { appsData, thirdPartyAppsData } from "@/config/apps";
import AppCard from "@/components/AppCard";
const IntroductionAnimation = lazy(
	() => import("./../components/IntroductionAnimation")
);

const HomePage: React.FC = () => {
	const [isPanelOpen, setIsPanelOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	const { user } = useAppSelector((state) => state.auth);
	const [isIntroOpen, setIsIntroOpen] = useState(false);
	const [hasSeenIntro, setHasSeenIntro] = useState(false);

	useEffect(() => {
		const introShown = localStorage.getItem("IntroductionShown");
		if (introShown) {
			setHasSeenIntro(true);
		} else {
			setIsIntroOpen(true);
		}
	}, []);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const handleDiscover = () => {
		setIsPanelOpen(true);
	};

	const openIntroduction = () => {
		setIsIntroOpen(true);
	};

	const closeIntroduction = () => {
		setIsIntroOpen(false);
		localStorage.setItem("IntroductionShown", "true");
		setHasSeenIntro(true);
	};

	useEffect(() => {
		if (user) {
			setIsPanelOpen(true);
		}
	}, [user]);

	return (
		<>
			<div className="relative h-screen">
				{/* First Panel */}
				<div
					className={cn(
						"absolute inset-0 flex flex-col items-center justify-center overflow-hidden touch-none",
						"transition-all duration-500 ease-in-out",
						"bg-background z-0",
						"pb-16 sm:pb-24", // Compensate for header height
						isPanelOpen ? "-translate-y-full" : "translate-y-0"
					)}
				>
					<h1
						className={cn(
							"font-syne font-extrabold uppercase m-0 mb-5",
							"text-[clamp(25px,6vw,80px)]",
							"dark:text-gray-100 text-gray-900 transition-colors duration-300"
						)}
					>
						Alexandria
					</h1>
					<p
						className={cn(
							"font-montserrat font-normal lowercase m-0 mb-10",
							"text-[clamp(18px,4vw,50px)]",
							"dark:text-gray-100 text-gray-900 transition-colors duration-300"
						)}
					>
						a sane way to use the internet
					</p>
					<div className="flex flex-col sm:flex-row gap-4 md:gap-6">
						<button
							onClick={handleDiscover}
							className={cn(
								"flex justify-center items-center gap-5 px-10 py-5",
								"rounded-full border",
								"font-syne text-[clamp(14px,4vw,24px)] font-semibold",
								"cursor-pointer transition-all duration-300",
								"dark:border-gray-100 dark:text-black dark:bg-gray-200",
								"border-gray-900 text-white bg-gray-900",
								"hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white"
							)}
						>
							Discover
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								className="rotate-90"
							>
								<path
									d="M6.38909 0.192139C6.18752 0.192139 5.98125 0.271826 5.82656 0.426514C5.51719 0.735889 5.51719 1.24214 5.82656 1.55151L16.4156 12.1406L5.98125 22.575C5.67187 22.8843 5.67187 23.3906 5.98125 23.7C6.29062 24.0093 6.79688 24.0093 7.10625 23.7L18.1078 12.7031C18.4172 12.3937 18.4172 11.8875 18.1078 11.5781L6.95625 0.426514C6.79688 0.267139 6.59534 0.192139 6.38909 0.192139Z"
									className="fill-current"
								/>
							</svg>
						</button>
						<button
							onClick={openIntroduction}
							className={cn(
								"flex justify-center items-center gap-5 px-10 py-5",
								"rounded-full border",
								"font-syne text-[clamp(14px,4vw,24px)] font-semibold",
								"cursor-pointer transition-all duration-300",
								"dark:border-gray-400 dark:text-gray-200 dark:bg-transparent",
								"border-gray-700 text-gray-700 bg-transparent",
								"hover:bg-gray-100 hover:text-black dark:hover:bg-gray-800 dark:hover:text-white"
							)}
						>
							What is this place?
						</button>
					</div>
				</div>
				{/* Second Panel */}
				<div
					className={cn(
						"absolute top-full left-0 w-full h-full",
						"flex flex-col items-center",
						"bg-background overflow-y-auto z-0",
						"transition-all duration-500 ease-in-out",
						"py-5 md:py-10",
						isPanelOpen ? "-translate-y-full" : "translate-y-0"
					)}
				>
					<button
						onClick={() => setIsPanelOpen(false)}
						className={cn(
							"absolute top-4 left-4 z-10 flex items-center justify-center p-2 rounded-full",
							"bg-gray-800 text-white hover:bg-gray-700 transition-colors duration-300",
							"dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300"
						)}
						aria-label="Go back to top"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="rotate-180"
						>
							<polyline points="6 9 12 15 18 9"></polyline>
						</svg>
					</button>
					{/* Alexandria Apps Section */}
					<h2
						className={cn(
							"self-stretch text-center",
							"font-syne font-semibold",
							"text-[clamp(30px,6vw,60px)]",
							"text-foreground transition-colors duration-300",
							"m-0"
						)}
					>
						Alexandria Apps
					</h2>
					<div
						className={cn(
							"grid gap-2.5 md:gap-5 w-full max-w-[1200px] px-2.5 mt-10",
							isMobile
								? "grid-cols-2"
								: "grid-cols-[repeat(auto-fit,minmax(180px,1fr))]"
						)}
					>
						{appsData.map((app) => (
							<AppCard key={app.name} app={app} size="default" />
						))}
					</div>

					{/* 3rd Party Apps Section */}
					{thirdPartyAppsData.length > 0 && (
						<>
							<h2
								className={cn(
									"self-stretch text-center",
									"font-syne font-semibold",
									"text-[clamp(25px,5vw,50px)]",
									"text-foreground transition-colors duration-300",
									"m-0 mt-16"
								)}
							>
								Third Party Apps
							</h2>
							<div
								className={cn(
									"grid gap-2.5 md:gap-5 w-full max-w-[1200px] px-2.5 mt-10",
									isMobile
										? "grid-cols-2"
										: "grid-cols-[repeat(auto-fit,minmax(180px,1fr))]"
								)}
							>
								{thirdPartyAppsData.map((app) => (
									<AppCard
										key={app.name}
										app={app}
										size="default"
									/>
								))}
							</div>
						</>
					)}
				</div>
			</div>
			<Suspense fallback={<div>Loading...</div>}>
				<IntroductionAnimation
					isOpen={isIntroOpen}
					onClose={closeIntroduction}
				/>
			</Suspense>
		</>
	);
};

export default HomePage;
