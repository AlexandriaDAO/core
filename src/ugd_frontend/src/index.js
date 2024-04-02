import React from "react";
import { createRoot } from "react-dom/client";
import WebFont from "webfontloader";
import App from "./App";

WebFont.load({
	google: {
		families: ["Syne", "Roboto Condensed"],
	},
});

document.addEventListener("DOMContentLoaded", () => {
	createRoot(document.getElementById("root")).render(
		<React.StrictMode>
			<App />
		</React.StrictMode>
	);
});