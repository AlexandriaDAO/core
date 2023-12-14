import React, {useEffect, useState} from "react";
import { createRoot } from "react-dom/client";
import WebFont from "webfontloader";
import MessageProvider from "./utils/MessageProvider";
import { AuthorProvider } from "./contexts/AuthorContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import "./styles/tailwind.css";
import "./styles/main.css";
import "../assets/index.css";

import { AuthClient } from "@dfinity/auth-client";

const App = () => {
  const [authClient, setAuthClient] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState(null);  

  useEffect(() => {
    const initializeAuthClient = async () => {
      try {
        const client = await AuthClient.create();
        setAuthClient(client);

        if (await client.isAuthenticated()) {
          handleAuthenticated(client);
        }
      } catch (error) {
        console.error("Error initializing AuthClient:", error);
      }
    };

    initializeAuthClient();
  }, []);

  const handleLogin = async () => {
    if (!authClient) return;

    authClient.login({
      maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
      onSuccess: () => handleAuthenticated(authClient),
    });
  };

  const handleAuthenticated = async (client) => {
    const userIdentity = await client.getIdentity();
    console.log("Identity: ", userIdentity);
    setIdentity(userIdentity);

    const userPrincipal = userIdentity.getPrincipal().toString();
    console.log("Principal: ", userPrincipal);
    setPrincipal(userPrincipal);
  };

  const handleLogout = async () => {
    if (!authClient) return;

    await authClient.logout();

    setIdentity(null);
    setPrincipal(null);

    console.log("User logged out");
  };

  return (
    <MessageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Layout />} />
        </Routes>
        <button onClick={handleLogin}>Login</button>
        <button onClick={handleLogout}>Logout</button>
      </BrowserRouter>
    </MessageProvider>
  );
};

WebFont.load({
  google: {
    families: [
      "Georgia",
      "Lobster",
      "Lexend",
      "Roboto:300,400,700",
      "Times New Roman",
      "Nunito",
    ],
  },
});


document.addEventListener("DOMContentLoaded", () => {
  const semanticLibraryRoot = document.getElementById("semantic-library-root");
  if (semanticLibraryRoot) {
    const root = createRoot(semanticLibraryRoot);
    root.render(
      <React.StrictMode>
        <AuthorProvider>
          <SettingsProvider>
            <App />
          </SettingsProvider>
        </AuthorProvider>
      </React.StrictMode>
    );
  }
});








