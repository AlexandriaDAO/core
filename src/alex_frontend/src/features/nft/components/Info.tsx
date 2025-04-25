import React, { useState, useEffect } from "react";
import { X, Loader } from "lucide-react";
import { Button } from "@/lib/components/button";
import Copy from "@/components/Copy";
import { Alert } from "@/components/Alert";

interface InfoProps {
	tags: { name: string; value: string }[];
	loading: boolean;
	error: string | null;
	onClose: () => void;
}

const Info: React.FC<InfoProps> = ({ tags, onClose, loading, error }) => {
	const [isClosing, setIsClosing] = useState(false);

	const handleClose = () => {
		setIsClosing(true);
		setTimeout(() => {
			onClose();
		}, 300); // Match this with the animation duration
	};

	// if (loading) {
	// 	return <div>Loading...</div>;
	// }

	// if (error) {
	// 	return <div>Error: {error}</div>;
	// }


	const scrollClasses = "overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400";

	return (
		// slide out from top right corner
		// <div className="absolute inset-0 bg-black/90 text-white p-2 overflow-auto w-full h-full flex flex-col justify-between items-center animate-in zoom-in duration-300 origin-top-right">
		<div className={`z-10 gap-2 font-roboto-condensed absolute inset-0 bg-black/90 text-white p-2 overflow-auto w-full h-full flex flex-col justify-between items-center ${
			isClosing ? 'animate-out slide-out-to-top duration-300' : 'animate-in slide-in-from-top duration-300'
		}`}>

			<div className="flex justify-between items-center w-full">
				<h3 className="font-bold">Tags</h3>
				<Button
					onClick={handleClose}
					variant="outline"
					scale="icon"
					rounded="full"
				>
					<X size={18} />
				</Button>
			</div>

			<div className="flex-grow flex justify-center items-center text-xs w-full overflow-hidden">
				{loading ? (
					<Loader className="animate-spin text-white h-8 w-8" />
				) : error ? (
					// <div>Error: {error}</div>
					<Alert variant="danger" title="Error" className="w-11/12">
						{error}
					</Alert>

				) : tags.length <= 0 ? (
					<Alert variant="default" title="No Tags" className="w-11/12">
						No tags were found for this transaction
					</Alert>
				) : (
					<div className={`max-h-full border border-white/20 rounded p-2 bg-black/50 space-y-1 ${scrollClasses}`}>
						{tags.map((tag, index) => (
							<div
								key={index}
								className="flex flex-wrap items-start border-b border-white/10 last:border-0"
							>
								<span className="font-semibold text-blue-300 mr-2 whitespace-nowrap">
									{tag.name}:
								</span>
								<span className="text-white/90 break-all flex-1">
									{tag.value}
								</span>
								<Copy size="sm" text={tag.value} />
							</div>
						))}
					</div>
				)}
			</div>


		</div>
	);
};

export default Info;
