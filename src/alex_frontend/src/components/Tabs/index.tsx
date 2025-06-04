import React, { lazy, Suspense } from "react";

const AppsTab = lazy(() => import("./AppsTab").then(module => ({ default: module.AppsTab })));
const SwapTab = lazy(() => import("./SwapTab").then(module => ({ default: module.SwapTab })));
const InfoTab = lazy(() => import("./InfoTab").then(module => ({ default: module.InfoTab })));

export default function Tabs() {
    // These are heavy components, so we need to lazy load them
    // That way ui for home is not blocked
    return (
        <div className="md:flex block items-center gap-6 justify-center md:w-[calc(100%-170px)]">
            <Suspense fallback={<span className="cursor-not-allowed font-syne md:text-[20px] font-semibold leading-normal tracking-normal flex justify-center items-center text-[#FFF] py-2 sm:text-[15px] opacity-50">APPS</span>}><AppsTab /></Suspense>
            <Suspense fallback={<span className="cursor-not-allowed font-syne md:text-[20px] font-semibold leading-normal tracking-normal flex justify-center items-center text-[#FFF] py-2 sm:text-[15px] opacity-50">SWAP</span>}><SwapTab /></Suspense>
            <Suspense fallback={<span className="cursor-not-allowed font-syne md:text-[20px] font-semibold leading-normal tracking-normal flex justify-center items-center text-[#FFF] py-2 sm:text-[15px] opacity-50">INFO</span>}><InfoTab /></Suspense>
        </div>
    );
}
