import React, { useEffect } from "react";
import NProgress from "nprogress";

const TopProgressBar = () => {
    useEffect(() => {
        NProgress.start();

        return () => {
            NProgress.done();
        };
    }, []);

    return <div className="w-full h-20 flex justify-center items-center">Loading...</div>;
}
export default TopProgressBar;
