import React, { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import 'github-markdown-css/github-markdown.css';

function AuditPage() {
	const [content, setContent] = useState('Please wait...');

	useEffect(() => {
		fetch('/audit.md')
			.then(response => response.text())
			.then(text => setContent(text))
			.catch(error => console.error('Error fetching content:', error));
	}, []);
	return (
		<div className="markdown-body bg-[#161b22] text-[#c9d1d9] p-4 md:p-8 rounded-lg shadow-lg">
			<ReactMarkdown>{content}</ReactMarkdown>
		</div>
	);
}

export default AuditPage; 