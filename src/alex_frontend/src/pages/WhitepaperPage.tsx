import React, { useState, useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import ReactMarkdown from 'react-markdown';
import { Container, Grid } from 'semantic-ui-react';
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
			<Container fluid style={{ padding: '2rem 0', backgroundColor: 'black', minHeight: '100vh' }}>
				<Grid centered>
					<Grid.Column width={14} style={{ maxWidth: '1200px' }}>
						<div className="markdown-body" style={{
							color: '#c9d1d9',
							padding: '2rem',
							borderRadius: '8px',
							backgroundColor: '#0d1117',
							margin: '0 auto',
						}}>
							<ReactMarkdown>{whitepaper}</ReactMarkdown>
						</div>
					</Grid.Column>
				</Grid>
			</Container>
		</MainLayout>
	);
}

export default WhitepaperPage;

