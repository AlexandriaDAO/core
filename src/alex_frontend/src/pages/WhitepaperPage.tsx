import React, { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import 'github-markdown-css/github-markdown.css';
import { Button } from "@/lib/components/button";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/lib/components/accordion";
import MainLayout from "@/layouts/MainLayout";

interface FAQItem {
	question: string;
	answer: string;
}

interface FAQSection {
	title: string;
	items: FAQItem[];
}

function WhitepaperPage() {
	const [content, setContent] = useState('');
	const [showWhitepaper, setShowWhitepaper] = useState(false);

	useEffect(() => {
		fetch(showWhitepaper ? '/README.md' : '/faq.md')
			.then(response => response.text())
			.then(text => setContent(text))
			.catch(error => console.error('Error fetching content:', error));
	}, [showWhitepaper]);

	// Parse FAQ content into sections
	const sections: FAQSection[] = !showWhitepaper && content ? content.split('\n\n').reduce((acc: FAQSection[], block) => {
		// Skip empty blocks
		if (!block.trim()) return acc;

		// If this is a section title (single line ending with ':')
		if (!block.includes('\n') && block.endsWith(':')) {
			acc.push({
				title: block.replace(':', '').trim(),
				items: []
			});
		}
		// If this starts with a number, it's a Q&A pair
		else if (acc.length > 0 && /^\d+\./.test(block)) {
			const currentSection = acc[acc.length - 1];
			const lines = block.split('\n');
			const question = lines[0].replace(/^\d+\.\s/, '').trim();
			const answer = lines.slice(1).join('\n').trim();
			
			currentSection.items.push({
				question,
				answer
			});
		}
		// If this is additional content for the last answer
		else if (acc.length > 0 && acc[acc.length - 1].items.length > 0) {
			const currentSection = acc[acc.length - 1];
			const currentItem = currentSection.items[currentSection.items.length - 1];
			currentItem.answer = currentItem.answer
				? currentItem.answer + '\n\n' + block
				: block;
		}
		
		return acc;
	}, []) : [];

	return (
		<>
			<div className="flex-grow bg-[#0d1117] p-4 md:p-8 overflow-auto">
				<div className="max-w-4xl mx-auto">
					<div className="flex justify-between items-center mb-6">
						<h1 className="text-3xl font-bold text-white">{showWhitepaper ? '' : 'FAQs'}</h1>
						<Button
							onClick={() => setShowWhitepaper(!showWhitepaper)}
							variant="outline"
						>
							Show {showWhitepaper ? 'FAQ' : 'Whitepaper'}
						</Button>
					</div>

					{showWhitepaper ? (
						<div className="markdown-body bg-[#161b22] text-[#c9d1d9] p-4 md:p-8 rounded-lg shadow-lg">
							<ReactMarkdown>{content}</ReactMarkdown>
						</div>
					) : (
						<div className="space-y-6">
							{sections.map((section, idx) => (
								<div key={idx} className="bg-[#161b22] rounded-lg shadow-lg p-4 md:p-6">
									<h2 className="text-xl font-semibold text-white mb-4">{section.title}</h2>
									<Accordion type="single" collapsible className="space-y-2">
										{section.items.map((item, itemIdx) => (
											<AccordionItem key={itemIdx} value={`item-${idx}-${itemIdx}`}>
												<AccordionTrigger className="text-white hover:text-white hover:no-underline">
													{item.question}
												</AccordionTrigger>
												<AccordionContent className="text-[#c9d1d9] whitespace-pre-wrap">
													<ReactMarkdown>{item.answer}</ReactMarkdown>
												</AccordionContent>
											</AccordionItem>
										))}
									</Accordion>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</>
	);
}

export default WhitepaperPage;

