import React from "react";
import { Link } from "react-router";
import { Button } from "@/lib/components/button";
import { CloudUpload } from "lucide-react";

function AssetsPage() {
	return (
		<>
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">My Assets</h1>
				<Link to="upload">
					<Button variant='link' scale="sm" className="flex justify-between gap-2 items-center">
						<CloudUpload size={18}/>
						<span>Upload Content</span>
					</Button>
				</Link>
			</div>
			<div className="font-roboto-condensed bg-white rounded-lg shadow-md p-6">
				<div className="mb-6 text-gray-600 font-roboto-condensed">List of my uploaded content</div>

				<div>My Assets main content</div>
			</div>
		</>
	);
}

export default AssetsPage;