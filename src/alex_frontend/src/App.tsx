import React from "react";
import ReduxProvider from "./providers/ReduxProvider";

import "./styles/tailwind.css";
import SessionProvider from "./providers/SessionProvider";

import "./styles/style.css";

import "nprogress/nprogress.css";

import AuthProvider from "./providers/AuthProvider";
import ActorProvider from "./providers/ActorProvider";
import UserProvider from "./providers/UserProvider";
import { AppRoutes } from "./routes";
import { ThemeProvider } from "./providers/ThemeProvider";

export default function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <AuthProvider>
                <ActorProvider>
                    <ReduxProvider>
                        <UserProvider>
                            <SessionProvider>
                                <AppRoutes />
                            </SessionProvider>
                        </UserProvider>
                    </ReduxProvider>
                </ActorProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}