import React, { ReactNode, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import { useLocation } from 'react-router-dom';

// Define types for component props
type MarkdownComponentProps = {
	node?: any;
	children?: ReactNode;
	[key: string]: any;
};

type MarkdownRendererProps = {
    content: string;
    className?: string;
};

// Function to convert heading text to a slug for IDs
const slugify = (text: string) => {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
        .trim(); // Trim leading/trailing whitespace
};

// Custom remark plugin to fix inline code rendering
const remarkFixInlineCode = () => {
	return (tree: any) => {
		visit(tree, 'inlineCode', (node) => {
			// Add a custom property to mark this as truly inline
			node.data = node.data || {};
			node.data.hProperties = node.data.hProperties || {};
			node.data.hProperties.className = 'true-inline-code';
		});
	};
};

// Custom components for markdown rendering
const MarkdownComponents: Components = {
	// Customize headings with IDs for anchor links
	h1: ({ node, children, ...props }: MarkdownComponentProps) => {
		const id = slugify(children?.toString() || '');
		return <h1 id={id} className="text-2xl font-bold mb-4 mt-6" {...props}>{children}</h1>;
	},
	h2: ({ node, children, ...props }: MarkdownComponentProps) => {
		const id = slugify(children?.toString() || '');
		return <h2 id={id} className="text-xl font-bold mb-3 mt-5" {...props}>{children}</h2>;
	},
	h3: ({ node, children, ...props }: MarkdownComponentProps) => {
		const id = slugify(children?.toString() || '');
		return <h3 id={id} className="text-lg font-bold mb-2 mt-4" {...props}>{children}</h3>;
	},
	
	// Customize paragraphs
	p: ({ node, children, ...props }: MarkdownComponentProps) => <p className="mb-4" {...props}>{children}</p>,
	
	// Customize links
	a: ({ node, children, href, ...props }: MarkdownComponentProps & { href?: string }) => {
		// Check if it's an anchor link (starts with #)
		const isAnchorLink = href?.startsWith('#');
		
		return (
			<a 
				className="text-primary hover:underline" 
				href={href}
				onClick={(e) => {
					if (isAnchorLink && href) {
						e.preventDefault();
						// Get the element with the ID matching the href (without the #)
						const targetId = href.substring(1);
						const targetElement = document.getElementById(targetId);
						
						if (targetElement) {
							// Scroll to the element
							targetElement.scrollIntoView({ behavior: 'smooth' });
							// Update URL hash without triggering navigation
							window.history.pushState(null, '', href);
						}
					}
				}}
				{...props}
			>
				{children}
			</a>
		);
	},
	
	// Customize lists
	ul: ({ node, children, ...props }: MarkdownComponentProps) => <ul className="list-disc pl-6 mb-4" {...props}>{children}</ul>,
	ol: ({ node, children, ...props }: MarkdownComponentProps) => <ol className="list-decimal pl-6 mb-4" {...props}>{children}</ol>,
	li: ({ node, children, ...props }: MarkdownComponentProps) => <li className="mb-1" {...props}>{children}</li>,
	
	// Fix for inline code - using a simpler approach
	code: ({ node, inline, className, children, ...props }: MarkdownComponentProps & { inline?: boolean }) => {
		// Check for our custom class that indicates true inline code
		const isTrueInline = className && className.includes('true-inline-code');
		
		if (inline || isTrueInline) {
			return (
				<code 
					className="bg-gray-800 px-1 py-0.5 rounded text-sm font-mono" 
					style={{ display: 'inline' }}
					{...props}
				>
					{children}
				</code>
			);
		}
		
		// For block code, keep the original implementation
		return (
			<pre className="bg-gray-800 p-4 rounded-md overflow-x-auto mb-4">
				<code className="text-sm font-mono" {...props}>{children}</code>
			</pre>
		);
	},
	
	// Customize tables with better styling
	table: ({ node, children, ...props }: MarkdownComponentProps) => (
		<div className="overflow-x-auto mb-6 border border-gray-700 rounded-md">
			<table className="w-full border-collapse" {...props}>{children}</table>
		</div>
	),
	thead: ({ node, children, ...props }: MarkdownComponentProps) => <thead className="bg-gray-800 border-b border-gray-700" {...props}>{children}</thead>,
	tbody: ({ node, children, ...props }: MarkdownComponentProps) => <tbody className="divide-y divide-gray-700" {...props}>{children}</tbody>,
	tr: ({ node, children, ...props }: MarkdownComponentProps) => <tr className="hover:bg-gray-800/50" {...props}>{children}</tr>,
	th: ({ node, children, ...props }: MarkdownComponentProps) => <th className="px-4 py-3 text-left font-bold" {...props}>{children}</th>,
	td: ({ node, children, ...props }: MarkdownComponentProps) => <td className="px-4 py-3 border-x border-gray-700" {...props}>{children}</td>,
	
	// Customize blockquotes
	blockquote: ({ node, children, ...props }: MarkdownComponentProps) => (
		<blockquote className="border-l-4 border-gray-500 pl-4 py-1 mb-4 italic" {...props}>{children}</blockquote>
	),
};

function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
	const location = useLocation();
	
	// Handle hash navigation when component mounts or when hash changes
	useEffect(() => {
		if (location.hash) {
			// Remove the # character
			const id = location.hash.substring(1);
			// Find the element with that ID
			const element = document.getElementById(id);
			
			// If element exists, scroll to it
			if (element) {
				setTimeout(() => {
					element.scrollIntoView({ behavior: 'smooth' });
				}, 100); // Small delay to ensure content is rendered
			}
		}
	}, [location.hash, content]);
	
	return (
		<div className={`p-4 md:p-8 rounded-lg shadow-lg bg-gray-900 text-gray-100 ${className}`}>
			<ReactMarkdown 
				components={MarkdownComponents}
				remarkPlugins={[remarkGfm, remarkFixInlineCode]}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}

export default MarkdownRenderer; 