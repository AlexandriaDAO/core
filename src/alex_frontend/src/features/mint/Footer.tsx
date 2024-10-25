import { Button } from "@/lib/components/button";
import { DialogClose } from "@/lib/components/dialog";
import { message } from "antd";
import React from "react";

const Footer = ({
	screen,
	next,
	prev,
	handleSubmitClick,
	validateSubmission,
	handleCancel,
	file,
}: any) => {
	return (
		<footer className="flex justify-between items-center p-4 gap-2">
			{screen == 0 && (
				<button
					type="button"
					onClick={() => next()}
					className={`rounded px-3 py-1 ${
						!file
							? "bg-blue-300 text-white cursor-not-allowed"
							: "bg-blue-700 hover:bg-blue-500 text-white"
					} focus:shadow-outline focus:outline-none`}
					disabled={!file ? true : false}
				>
					Next
				</button>
			)}
			{screen == 1 && (
				<div className="flex justify-start gap-2 items-center">
					<button
						type="button"
						onClick={()=>{
							if(validateSubmission()){
								next()
							}
						}}
						className="rounded px-3 py-1 bg-blue-700 hover:bg-blue-500 text-white focus:shadow-outline focus:outline-none"
					>
						Next
					</button>

					<button
						type="button"
						onClick={() => prev()}
						className="rounded px-3 py-1 bg-blue-700 hover:bg-blue-500 text-white focus:shadow-outline focus:outline-none"
					>
						Go Back
					</button>
				</div>
			)}

			{screen == 2 && (
				<div className="flex justify-start gap-2 items-center">
					<button
						type="button"
						onClick={handleSubmitClick}
						className="rounded px-3 py-1 bg-blue-700 hover:bg-blue-500 text-white focus:shadow-outline focus:outline-none"
					>
						Submit
					</button>

					<button
						type="button"
						onClick={() => prev()}
						className="rounded px-3 py-1 bg-blue-700 hover:bg-blue-500 text-white focus:shadow-outline focus:outline-none"
					>
						Go Back
					</button>
				</div>
			)}

			{screen == 4 && (
				<button
					type="button"
					onClick={() => window.location.reload()}
					className={`rounded px-3 py-1 bg-blue-700 hover:bg-blue-500 text-white focus:shadow-outline focus:outline-none`}
				>
					Refresh
				</button>
			)}


			<DialogClose asChild>
				<Button type="button" variant="outline">Close</Button>
			</DialogClose>
		</footer>
	);
};

export default Footer;
