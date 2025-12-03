import React from "react";
import { PenSquare, Shield, Infinity } from "lucide-react";
import ArticleComposer from "../components/ArticleComposer";

const WritePage: React.FC = () => {
	return (
		<div className="min-h-screen">
			{/* Header */}
			<div className="border-b bg-muted/30">
				<div className="container mx-auto px-4 py-8 max-w-4xl">
					<div className="flex items-center gap-3 mb-2">
						<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
							<PenSquare className="h-5 w-5 text-primary" />
						</div>
						<h1 className="text-2xl font-bold">Write Article</h1>
					</div>
					<p className="text-muted-foreground">
						Create content that lasts forever. Your article will be stored on Arweave and minted as an NFT.
					</p>
					<div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<Infinity className="h-4 w-4 text-primary" />
							<span>Permanent storage</span>
						</div>
						<div className="flex items-center gap-2">
							<Shield className="h-4 w-4 text-primary" />
							<span>NFT ownership</span>
						</div>
					</div>
				</div>
			</div>

			{/* Editor */}
			<div className="container mx-auto px-4 py-8 max-w-4xl">
				<ArticleComposer />
			</div>
		</div>
	);
};

export default WritePage;
