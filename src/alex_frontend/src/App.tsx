import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import ReduxProvider from "./providers/ReduxProvider";

import "./styles/tailwind.css";
// import SessionProvider from "./providers/SessionProvider";

// import "./styles/style.css";

import "nprogress/nprogress.css";

import AuthProvider from "./providers/AuthProvider";
// import ActorProvider from "./providers/ActorProvider";
import UserProvider from "./providers/UserProvider";
import { AppRoutes } from "./routes";
import { ThemeProvider } from "./providers/ThemeProvider";
import ActorProvider from "./providers/ActorProvider";
import IdentityProvider from "./providers/IdentityProvider";
import ErrorFallback from "./components/fallbacks/ErrorFallback";

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
                <ReduxProvider>
                    <IdentityProvider>
                        <AuthProvider>
                            <ActorProvider>
                               <UserProvider>
                                    <AppRoutes />
                                </UserProvider>
                            </ActorProvider>
                        </AuthProvider>
                    </IdentityProvider>
                </ReduxProvider>
            </ThemeProvider>
        </ErrorBoundary>
    )
}