import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReduxProvider from "./providers/ReduxProvider";
import RiskWarningModal from "./components/RiskWarningModal";
import { useRiskWarning } from "./hooks/useRiskWarning";

import "./styles/tailwind.css";
import SessionProvider from "./providers/SessionProvider";

import "./styles/style.css";

import AuthenticationProvider from "./providers/AuthenticationProvider";
import ActorProvider from "./providers/ActorProvider";
import { routes } from "./routes";

export default function App() {
    const { showRiskWarning, handleCloseRiskWarning } = useRiskWarning();

    return (
        <AuthenticationProvider>
            <ActorProvider>
                <ReduxProvider>
                    <SessionProvider>
                        <BrowserRouter>
                            {showRiskWarning && <RiskWarningModal onClose={handleCloseRiskWarning} open={showRiskWarning} />}
                            <Routes>
                                {routes.map((route) => (
                                    <Route key={route.path} path={route.path} element={route.element} />
                                ))}
                            </Routes>
                        </BrowserRouter>
                    </SessionProvider>
                </ReduxProvider>
            </ActorProvider>
        </AuthenticationProvider>
    );
}