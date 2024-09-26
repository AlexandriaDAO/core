import React, { useState, useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import ReactMarkdown from 'react-markdown';
import 'github-markdown-css/github-markdown.css';

function WhitepaperPage() {
	const [whitepaper, setWhitepaper] = useState('');

	useEffect(() => {
		fetch('/README.md')
			.then(response => response.text())
			.then(text => setWhitepaper(text))
			.catch(error => console.error('Error fetching whitepaper:', error));
	}, []);

	return (
		<MainLayout>
			<div className="flex-grow bg-[#0d1117] p-4 md:p-8 overflow-auto">
				<div className="max-w-4xl mx-auto">
					<div className="markdown-body bg-[#161b22] text-[#c9d1d9] p-4 md:p-8 rounded-lg shadow-lg">
						<ReactMarkdown>{whitepaper}</ReactMarkdown>
					</div>
				</div>
			</div>
		</MainLayout>
	);
}

export default WhitepaperPage;

