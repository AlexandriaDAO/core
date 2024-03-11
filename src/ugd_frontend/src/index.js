import React from "react";
import { createRoot } from "react-dom/client";
import store from './store'
import { Provider } from 'react-redux'
import WebFont from "webfontloader";
import MessageProvider from "./utils/MessageProvider";
import { AuthorProvider } from "./contexts/AuthorContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import "./styles/tailwind.css";
import "./styles/main.css";
import "../assets/index.css";
import { useAuth } from "./utils/AuthProvider";
import { BookMarkedSourceCardProvider } from "./utils/BookMarkedSourceCardProvider";

const App = () => {
  const { handleLogin, handleLogout, UID } = useAuth();

  return (
    <MessageProvider>
      <BookMarkedSourceCardProvider>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<Layout />} />
          </Routes>
        </BrowserRouter>
      </BookMarkedSourceCardProvider>
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
        <Provider store={store}>
          <AuthorProvider>
            <SettingsProvider>
              <App />
            </SettingsProvider>
          </AuthorProvider>
        </Provider>
      </React.StrictMode>
    );
  }
});