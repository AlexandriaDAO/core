import React, { useRef, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import ReduxProvider from "@/providers/ReduxProvider";

import "../tailwind.css";
// import SessionProvider from "./providers/SessionProvider";

import NProgress from "nprogress";

// import "./styles/style.css";

import "nprogress/nprogress.css";

import UserProvider from "@/providers/UserProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import ActorProvider from "@/providers/ActorProvider";
import { IdentityProvider } from "@/lib/ic-use-identity";
import NsfwProvider from "@/providers/NsfwProvider";
import ErrorFallback from "@/components/fallbacks/ErrorFallback";


import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from "../routeTree.gen";
import { SWRConfig } from 'swr';
import ContentLoadingSpinner from "@/components/ContentLoadingSpinner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/lib/components/tooltip";



// Create a client
const queryClient = new QueryClient()

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultPendingComponent: ContentLoadingSpinner,
  defaultPendingMs: 0,          // Show immediately
  defaultPendingMinMs: 0        // Keep visible for 0ms minimum
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Subscribe to events
router.subscribe('onBeforeLoad', ({pathChanged}) => {
    if (pathChanged) {
        NProgress.start();
        // TanStack Query automatically handles request cancellation on route changes
        // Both SWR and TanStack Query caches are preserved for performance benefits
    }
});
router.subscribe('onLoad', () => NProgress.done())

export default function App() {
    // const [isReady, setIsReady] = useState(false);

    // // useEffect(() => {
    // //     const introduced = localStorage.getItem('IntroductionShown');
	// // 	if(!introduced) window.location.href = "/introduction"
    // // }, []);


    // // costs a re render
    // // Mark the app as ready after a short delay to ensure all providers are initialized
    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         setIsReady(true);
    //         console.log("App is ready");
    //     }, 100);
        
    //     return () => clearTimeout(timer);
    // }, []);

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                 <QueryClientProvider client={queryClient}>
                    <SWRConfig
                        value={{
                            revalidateOnFocus: false, // OPTIMIZATION: Disabled for better performance with long caches
                            revalidateOnReconnect: true, // Keep for network reconnection
                            dedupingInterval: 300000, // OPTIMIZATION: 5 minutes (longer deduping for our caching strategy)
                            errorRetryCount: 2, // Limit retries for failed requests
                            errorRetryInterval: 2000, // 2 second retry delay
                            focusThrottleInterval: 30000, // OPTIMIZATION: 30 second throttle if focus revalidation needed
                        }}
                    >
                        <ReduxProvider>
                            <IdentityProvider>
                                <ActorProvider />
                                <UserProvider />
                                <NsfwProvider>
                                    <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                                        <RouterProvider router={router} />
                                    </TooltipProvider>
                                </NsfwProvider>
                            </IdentityProvider>
                        </ReduxProvider>
                    </SWRConfig>
                 </QueryClientProvider>
            </ThemeProvider>
        </ErrorBoundary>
    )
}