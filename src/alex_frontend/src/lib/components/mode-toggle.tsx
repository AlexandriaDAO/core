import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

export function ModeToggle() {
	const { theme, setTheme } = useTheme();

	// Button component load time issue
	return (
		<button
			onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
			className="flex justify-center items-center hover:text-primary bg-white dark:bg-black relative w-[42px] h-[42px] border border-white rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
		>
			<Sun className="absolute rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 dark:color-white color-[#0F172A]" />
			<span className="sr-only">Toggle theme</span>
		</button>
	);
}
