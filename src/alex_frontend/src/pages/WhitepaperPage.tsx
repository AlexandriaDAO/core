import React, { useState, useEffect } from "react";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { useLocation } from "react-router-dom";

function WhitepaperPage() {
	const [content, setContent] = useState('Please wait...');
	const location = useLocation();

	useEffect(() => {
		fetch('/README.md')
			.then(response => response.text())
			.then(text => {
				setContent(text);
				
				// After content is loaded, check if there's a hash in the URL
				// and scroll to that section after a short delay to ensure rendering
				if (location.hash) {
					setTimeout(() => {
						const id = location.hash.substring(1);
						const element = document.getElementById(id);
						if (element) {
							element.scrollIntoView({ behavior: 'smooth' });
						}
					}, 300);
				}
			})
			.catch(error => console.error('Error fetching content:', error));
	}, [location.hash]);
	
	return (
		<MarkdownRenderer content={content} />
	);
}

export default WhitepaperPage;

