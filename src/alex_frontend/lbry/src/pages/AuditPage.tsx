import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import MarkdownRenderer from "@/components/MarkdownRenderer";

function AuditPage() {
	const [content, setContent] = useState("Please wait...");

	useEffect(() => {
		fetch("/audit.md")
			.then((response) => response.text())
			.then((text) => setContent(text))
			.catch((error) => console.error("Error fetching content:", error));
	}, []);

	return (
		<>
			<Helmet>
				<title>Audit | Alexandria</title>
				<meta name="description" content="Review the Alexandria platform security audit report." />
			</Helmet>
			<MarkdownRenderer content={content} />
		</>
	);
}

export default AuditPage;
