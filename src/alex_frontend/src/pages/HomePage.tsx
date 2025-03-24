import React, { useState, useEffect } from "react";
import { Link } from 'react-router';
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { cn } from "@/lib/utils";

export interface App {
  name: string;
  description: string;
  path: string;
  logo?: string;
  comingSoon?: boolean;
}

export const apps: App[] = [
  { name: 'Alexandrian', description: 'Library', path: '/app/alexandrian', logo: '/logos/Alexandrian.svg' },
  { name: 'Permasearch', description: 'Explore', path: '/app/permasearch', logo: '/logos/Permasearch.svg' },
  { name: 'Emporium', description: 'Trade', path: '/app/emporium', logo: '/logos/Emporium.svg' },
  { name: 'Pinax', description: 'Upload', path: '/app/pinax', logo: '/logos/Pinax.svg', comingSoon: false },
  { name: 'Syllogos', description: 'Aggregate', path: '/app/syllogos', logo: '/logos/Syllogos.svg', comingSoon: true },
  { name: 'Bibliotheca', description: 'Library', path: '/app/bibliotheca', comingSoon: true },
  { name: 'Perpetua', description: 'Write', path: '/app/perpetua', comingSoon: true },
  { name: 'Dialectica', description: 'Debate', path: '/app/dialectica', comingSoon: true },
];

const HomePage: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDiscover = () => {
    setIsPanelOpen(true);
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
        <div className={cn(
          "absolute inset-0 flex flex-col items-center justify-center overflow-hidden touch-none",
          "transition-all duration-500 ease-in-out",
          "bg-background z-0",
          isPanelOpen ? "-translate-y-full" : "translate-y-0"
        )}>
          <h1 className={cn(
            "font-syne font-extrabold uppercase m-0 mb-5",
            "text-[clamp(25px,6vw,80px)]",
            "dark:text-gray-100 text-gray-900 transition-colors duration-300"
          )}>
            Alexandria
          </h1>
          <p className={cn(
            "font-montserrat font-normal lowercase m-0 mb-10",
            "text-[clamp(18px,4vw,50px)]",
            "dark:text-gray-100 text-gray-900 transition-colors duration-300"
          )}>
            a sane way to use the internet
          </p>
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
        </div>
        {/* Second Panel */}
        <div className={cn(
          "absolute top-full left-0 w-full h-full",
          "flex flex-col items-center",
          "bg-background overflow-y-auto z-0",
          "transition-all duration-500 ease-in-out",
          "py-5 md:py-10",
          isPanelOpen ? "-translate-y-full" : "translate-y-0"
        )}>
          <h2 className={cn(
            "self-stretch text-center",
            "font-syne font-semibold",
            "text-[clamp(30px,6vw,60px)]",
            "text-foreground transition-colors duration-300",
            "m-0"
          )}>
            explore our apps
          </h2>
          <div className={cn(
            "grid gap-2.5 md:gap-5 w-full max-w-[1200px] px-2.5 mt-10",
            isMobile ? "grid-cols-2" : "grid-cols-[repeat(auto-fit,minmax(180px,1fr))]"
          )}>
            {apps.map((app) => (
              <Link 
                to={app.comingSoon ? '#' : app.path} 
                key={app.name} 
                className="no-underline w-full"
                onClick={(e) => app.comingSoon && e.preventDefault()}
              >
                <div className={cn(
                  "w-full min-h-[140px] p-2",
                  "rounded-2xl flex flex-col items-center justify-center gap-1.5",
                  "transition-all duration-300",
                  "shadow-md dark:shadow-lg group",
                  app.comingSoon 
                    ? "dark:bg-gray-850 bg-gray-100 cursor-not-allowed opacity-70"
                    : [
                        "dark:bg-gray-800 bg-gray-50 cursor-pointer opacity-100",
                        "hover:shadow-xl dark:hover:shadow-2xl",
                        "hover:bg-gray-100 dark:hover:bg-gray-700"
                      ].join(" ")
                )}>
                  <div className={cn(
                    "flex items-center justify-center m-1 transition-transform duration-300",
                    isMobile ? "w-20 h-20" : "w-[120px] h-[120px]",
                    !app.comingSoon && "group-hover:scale-110"
                  )}>
                    {app.comingSoon ? (
                      <div className="text-[#848484] font-syne text-sm font-semibold text-center">
                        COMING<br />SOON
                      </div>
                    ) : (
                      <img 
                        src={app.logo}
                        alt={`${app.name} logo`}
                        className="w-full h-full object-contain p-2 transition-transform duration-300 hover:scale-110"
                      />
                    )}
                  </div>
                  <div className={cn(
                    "font-syne font-bold",
                    "text-foreground transition-colors duration-300",
                    isMobile ? "text-sm" : "text-lg"
                  )}>
                    {app.name}
                  </div>
                  <div className={cn(
                    "font-poppins font-normal",
                    "text-muted-foreground transition-colors duration-300",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
                    {app.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
