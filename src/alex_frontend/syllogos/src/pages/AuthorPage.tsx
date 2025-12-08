import React from "react";
import { useParams } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import AuthorProfileCard from "../components/AuthorProfileCard";
import ArticleFeed from "../components/ArticleFeed";

const AuthorPage: React.FC = () => {
	const { principal } = useParams({ from: "/author/$principal" });

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Author Profile Card */}
			<div className="mb-8">
				<AuthorProfileCard principal={principal} />
			</div>

			{/* Articles Header */}
			<div className="flex items-center gap-2 mb-6">
				<FileText className="h-5 w-5" />
				<h2 className="text-2xl font-bold">Articles by this Author</h2>
			</div>

			{/* Author's Articles */}
			<ArticleFeed userPrincipal={principal} />
		</div>
	);
};

export default AuthorPage;
