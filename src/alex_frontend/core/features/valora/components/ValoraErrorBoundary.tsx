import React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { Button } from "@/lib/components/button";
import { AlertTriangle } from "lucide-react";

function ValoraFallback({ error, resetErrorBoundary }: FallbackProps) {
	return (
		<div className="flex flex-col items-center justify-center gap-5 p-8 max-w-md mx-auto text-center animate-fade">
			<div className="h-14 w-14 rounded-full bg-destructive/10 dark:bg-red-900/30 flex items-center justify-center">
				<AlertTriangle className="h-7 w-7 text-destructive dark:text-red-400" />
			</div>
			<div>
				<h2 className="text-xl font-bold font-syne">Something went wrong</h2>
				<p className="text-base text-muted-foreground dark:text-gray-400 mt-2">
					{error?.message || "An unexpected error occurred."}
				</p>
			</div>
			<Button variant="primary" scale="sm" onClick={resetErrorBoundary}>
				Try Again
			</Button>
		</div>
	);
}

export default function ValoraErrorBoundary({ children }: { children: React.ReactNode }) {
	return (
		<ErrorBoundary FallbackComponent={ValoraFallback}>
			{children}
		</ErrorBoundary>
	);
}
