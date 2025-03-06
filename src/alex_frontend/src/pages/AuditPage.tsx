import React, { useState, useEffect } from "react";
import MarkdownRenderer from "../components/MarkdownRenderer";

function AuditPage() {
	const [content, setContent] = useState('Please wait...');

	useEffect(() => {
		fetch('/audit.md')
			.then(response => response.text())
			.then(text => setContent(text))
			.catch(error => console.error('Error fetching content:', error));
	}, []);
	
	return (
		<MarkdownRenderer content={content} />
	);
}

export default AuditPage; 