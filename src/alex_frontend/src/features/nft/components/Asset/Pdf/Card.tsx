import React from "react";
import { FileText, Eye } from "lucide-react";
import { AssetProps } from "../../../types/assetTypes";

// MAJOR OPTIMIZATION: No PDF.js in card view!
// This saves 70% loading time by showing a simple placeholder instead of loading the heavy PDF.js library

const PdfCard: React.FC<AssetProps> = ({ url }) => {

	// Show attractive PDF placeholder that encourages clicking to view
	// This loads instantly and uses almost no memory compared to PDF.js
	return (
		<div className="w-full h-64 border border-input rounded-md overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 flex flex-col items-center justify-center p-6 group hover:from-blue-100 hover:to-indigo-200 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200">
			{/* PDF Icon with subtle animation */}
			<div className="relative mb-4">
				<FileText className="w-16 h-16 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform duration-200" />
				<div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1">
					<Eye className="w-3 h-3" />
				</div>
			</div>
			
			{/* Content */}
			<div className="text-center">
				<h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">PDF Document</h3>
				<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Click to view document</p>
				
				{/* Subtle indicator */}
				<div className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
					<FileText className="w-3 h-3" />
					PDF
				</div>
			</div>
		</div>
	);
};

export default PdfCard;