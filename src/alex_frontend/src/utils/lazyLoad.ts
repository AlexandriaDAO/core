import { lazy } from "react";
import NProgress from "nprogress";

export const lazyLoad = (importFunc: () => Promise<any>) => {
	return lazy(async () => {
		NProgress.start();
		try {
            return await importFunc();
        } catch (error) {
            console.error(`Failed to load module`, error);
            throw error; // Re-throw to let React handle the error boundary
        } finally {
            NProgress.done();
        }
	});
};


export function wait(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}