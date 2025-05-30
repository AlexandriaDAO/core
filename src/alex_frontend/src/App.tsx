import React, { useEffect, useState } from "react";
import ReduxProvider from "./providers/ReduxProvider";

import "./styles/tailwind.css";
// import SessionProvider from "./providers/SessionProvider";

import "./styles/style.css";

import "nprogress/nprogress.css";

import AuthProvider from "./providers/AuthProvider";
// import ActorProvider from "./providers/ActorProvider";
import UserProvider from "./providers/UserProvider";
import { AppRoutes } from "./routes";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AssetManagerActor } from "./actors";
import { UserActor } from "./actors";

export default function App() {
    const [isReady, setIsReady] = useState(false);

    // useEffect(() => {
    //     const introduced = localStorage.getItem('IntroductionShown');
	// 	if(!introduced) window.location.href = "/introduction"
    // }, []);


    // costs a re render
    // Mark the app as ready after a short delay to ensure all providers are initialized
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsReady(true);
            console.log("App is ready");
        }, 100);
        
        return () => clearTimeout(timer);
    }, []);

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <ReduxProvider>
                <AuthProvider>
                    <UserActor>
                        <AssetManagerActor>
                            <UserProvider>
                                {isReady ? <AppRoutes /> : null}
                            </UserProvider>
                        </AssetManagerActor>
                    </UserActor>
                </AuthProvider>
            </ReduxProvider>
        </ThemeProvider>
    )
}