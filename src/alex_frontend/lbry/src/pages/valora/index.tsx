import React from "react";
import ValoraErrorBoundary from "@/features/valora/components/ValoraErrorBoundary";
import ValoraLayout from "@/features/valora/components/ValoraLayout";

export default function ValoraPage() {
	return (
		<ValoraErrorBoundary>
			<ValoraLayout />
		</ValoraErrorBoundary>
	);
}
