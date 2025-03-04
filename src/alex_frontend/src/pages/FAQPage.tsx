import React, { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/lib/components/accordion";

interface FAQItem {
	question: string;
	answer: string;
}

interface FAQSection {
	title: string;
	items: FAQItem[];
}

function FAQPage() {
	const [content, setContent] = useState('');

	useEffect(() => {
		fetch('/faq.md')
			.then(response => response.text())
			.then(text => setContent(text))
			.catch(error => console.error('Error fetching content:', error));
	}, []);

	// Parse FAQ content into sections
	const sections: FAQSection[] = content ? content.split('\n\n').reduce((acc: FAQSection[], block) => {
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
	}, []) : [{title: 'Please wait...', items: []}];

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<h1 className="text-3xl md:text-4xl font-syne font-bold text-white mb-8 text-center">Frequently Asked Questions</h1>
			<Accordion type="multiple" className="space-y-4">
				{sections.map((section, idx) => (
					<AccordionItem
						key={idx}
						value={`section-${idx}`}
						className="bg-gray-700/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-600/50"
					>
						<AccordionTrigger className="px-6 py-4 text-2xl font-syne font-semibold text-white hover:text-brightyellow hover:no-underline transition-colors">
							{section.title}
						</AccordionTrigger>
						<AccordionContent className="px-6 pb-6">
							<Accordion type="single" collapsible className="space-y-4">
								{section.items.map((item, itemIdx) => (
									<AccordionItem 
										key={itemIdx} 
										value={`item-${idx}-${itemIdx}`} 
										className="border border-gray-500/50 rounded-lg overflow-hidden bg-gray-600/50"
									>
										<AccordionTrigger className="px-4 py-3 text-lg font-roboto-condensed text-white hover:text-brightyellow hover:no-underline transition-colors">
											{item.question}
										</AccordionTrigger>
										<AccordionContent className="px-4 py-3 text-white/90 prose dark:prose-invert max-w-none">
											<ReactMarkdown>{item.answer}</ReactMarkdown>
										</AccordionContent>
									</AccordionItem>
								))}
							</Accordion>
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</div>
	);
}

export default FAQPage;

