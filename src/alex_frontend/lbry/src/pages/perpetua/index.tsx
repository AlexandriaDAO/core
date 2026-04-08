import React from "react";
import { Helmet } from "react-helmet-async";
import PerpetuaErrorBoundary from "@/features/perpetua/components/PerpetuaErrorBoundary";
import PerpetuaLayout from "@/features/perpetua/components/PerpetuaLayout";

export default function PerpetuaPage() {
	return (
		<>
			<Helmet>
				<title>Perpetua | Alexandria</title>
				<meta name="description" content="Discover and curate shelves of content on Alexandria." />
			</Helmet>
			<PerpetuaErrorBoundary>
				<PerpetuaLayout />
			</PerpetuaErrorBoundary>
		</>
	);
}
