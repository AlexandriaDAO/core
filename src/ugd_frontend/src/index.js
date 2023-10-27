import React from 'react';
import { createRoot } from 'react-dom/client';
import WebFont from 'webfontloader';
import MessageProvider from '../utils/MessageProvider'
import { AuthorProvider } from './contexts/AuthorContext'
import { SettingsProvider } from './contexts/SettingsContext';

WebFont.load({
  google: {
    families: ['Georgia', 'Lobster', 'Lexend', 'Roboto:300,400,700', "Times New Roman", 'Nunito']
  }
});

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Earn from "./pages/Earn";
import Create from "./pages/Create";
import Share from "./pages/Share";
import NotFound from "./pages/NotFound";

import '../styles/tailwind.css';
import '../styles/main.css';

const App = () => {
  return (
    <MessageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Create />} />
            <Route path="earn" element={<Earn />} />
            <Route path="share" element={<Share />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MessageProvider>
  );
};

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