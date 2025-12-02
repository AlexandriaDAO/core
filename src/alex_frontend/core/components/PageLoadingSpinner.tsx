import React from "react";
import { LoaderPinwheel } from "lucide-react";

const PageLoadingSpinner = () => (
	<div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
		<div className="flex flex-col items-center gap-3">
			<LoaderPinwheel className="h-8 w-8 animate-spin text-primary" />
			<p className="text-sm text-muted-foreground">Loading...</p>
		</div>
	</div>
);

export default PageLoadingSpinner;