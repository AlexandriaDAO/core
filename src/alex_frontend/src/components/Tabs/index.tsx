import React, { lazy, Suspense } from "react";

const AppsTab = lazy(() => import("./AppsTab").then(module => ({ default: module.AppsTab })));
// const SwapTab = lazy(() => import("./SwapTab").then(module => ({ default: module.SwapTab })));
const ExchangeTab = lazy(() => import("./ExchangeTab").then(module => ({ default: module.ExchangeTab })));
const InfoTab = lazy(() => import("./InfoTab").then(module => ({ default: module.InfoTab })));

export default function Tabs() {
    // These are heavy components, so we need to lazy load them
    // That way ui for home is not blocked
    return (
        <div className="flex items-center gap-2 sm:gap-4 md:gap-8 justify-center">
            <Suspense fallback={<span className="cursor-not-allowed font-syne text-[16px] sm:text-[18px] md:text-[20px] font-semibold leading-normal tracking-normal flex justify-center items-center text-[#FFF] py-1 sm:py-2 px-2 sm:px-3 opacity-50">APPS</span>}><AppsTab /></Suspense>
            {/* <Suspense fallback={<span className="cursor-not-allowed font-syne text-[16px] sm:text-[18px] md:text-[20px] font-semibold leading-normal tracking-normal flex justify-center items-center text-[#FFF] py-1 sm:py-2 px-2 sm:px-3 opacity-50">SWAP</span>}><SwapTab /></Suspense> */}
            <Suspense fallback={<span className="cursor-not-allowed font-syne text-[16px] sm:text-[18px] md:text-[20px] font-semibold leading-normal tracking-normal flex justify-center items-center text-[#FFF] py-1 sm:py-2 px-2 sm:px-3 opacity-50">SWAP</span>}><ExchangeTab /></Suspense>
            <Suspense fallback={<span className="cursor-not-allowed font-syne text-[16px] sm:text-[18px] md:text-[20px] font-semibold leading-normal tracking-normal flex justify-center items-center text-[#FFF] py-1 sm:py-2 px-2 sm:px-3 opacity-50">INFO</span>}><InfoTab /></Suspense>
        </div>
    );
}
