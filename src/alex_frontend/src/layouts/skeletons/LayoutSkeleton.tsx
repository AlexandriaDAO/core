import React, { useEffect } from "react";
import NProgress from "nprogress";

import HeaderSkeleton from "./HeaderSkeleton";
import SidebarSkeleton from "./SidebarSkeleton";
import MainPageSkeleton from "./MainPageSkeleton";

const LayoutSkeleton = () => {
    useEffect(() => {
		NProgress.start();
        return () => {
			NProgress.done();
        };
    }, []);
    return (
        <>
            {/* Header Skeleton */}
            <HeaderSkeleton />

            <div className="flex-grow flex items-stretch">
                {/* Sidebar Skeleton */}
                <SidebarSkeleton />

                {/* Main Content Skeleton */}
                <MainPageSkeleton />
            </div>
        </>
    );
};


export default LayoutSkeleton;