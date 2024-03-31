import React from "react";
import { createRoot } from "react-dom/client";
import WebFont from "webfontloader";
import ReduxProvider from "./store/ReduxProvider";
import MessageProvider from "./utils/MessageProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthorProvider } from "./contexts/AuthorContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import "./styles/tailwind.css";
// import "./styles/main.css";
// import "../assets/index.css";
import { BookMarkedSourceCardProvider } from "./utils/BookMarkedSourceCardProvider";

const App = () => {
  // const { handleLogin, handleLogout, UID } = useAuth();

  return (
    <MessageProvider>
      <BookMarkedSourceCardProvider>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<Layout />} />
            <Route path="/home" element={<Home />} />
          </Routes>
        </BrowserRouter>
      </BookMarkedSourceCardProvider>
    </MessageProvider>
  );
};


WebFont.load({
  google: {
    families: [
      // "Georgia",
      // "Lobster",
      // "Lexend",
      // "Roboto:300,400,700",
      // "Times New Roman",
      // "Nunito",
      "Syne",
      "Roboto Condensed"
    ],
  },
});

document.addEventListener("DOMContentLoaded", () => {
  const semanticLibraryRoot = document.getElementById("semantic-library-root");
  if (semanticLibraryRoot) {
    const root = createRoot(semanticLibraryRoot);
    root.render(
      <React.StrictMode>
          <ReduxProvider >
            <AuthorProvider>
              <SettingsProvider>
                <AuthProvider>
                  <App />
                </AuthProvider>
              </SettingsProvider>
            </AuthorProvider>
          </ReduxProvider>
      </React.StrictMode>
    );
  }
});