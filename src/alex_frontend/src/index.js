import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import WebFont from "webfontloader";
import App from "./App";

// Create a loading indicator
const loadingIndicator = document.createElement('div');
loadingIndicator.id = 'app-loading-indicator';
loadingIndicator.innerHTML = `
  <style>
    #app-loading-indicator {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background-color: #f5f5f5;
      z-index: 9999;
      transition: opacity 0.3s ease-out;
    }
    #app-loading-indicator.fade-out {
      opacity: 0;
    }
    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 5px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: #3498db;
      animation: spin 1s ease-in-out infinite;
    }
    .loading-text {
      margin-top: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 16px;
      color: #333;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
  <div class="loading-spinner"></div>
  <div class="loading-text">Loading Alexandria...</div>
`;
document.body.appendChild(loadingIndicator);

// Function to remove the loading indicator
function removeLoadingIndicator() {
  const indicator = document.getElementById('app-loading-indicator');
  if (indicator) {
    indicator.classList.add('fade-out');
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    }, 300);
  }
}

// Wrapper component to handle loading indicator removal
const AppWithLoadingHandler = () => {
  useEffect(() => {
    // Remove loading indicator after component mounts
    // Using a small timeout to ensure the app has rendered
    const timer = setTimeout(() => {
      removeLoadingIndicator();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return <App />;
};

WebFont.load({
	google: {
		families: ["Syne", "Roboto Condensed"],
	},
	active: () => {
		console.log("Fonts loaded");
	}
});

document.addEventListener("DOMContentLoaded", () => {
	createRoot(document.getElementById("root")).render(
		<React.StrictMode>
			<AppWithLoadingHandler />
		</React.StrictMode>
	);
});