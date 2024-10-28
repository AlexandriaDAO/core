import { Button } from "@/lib/components/button";
import { DialogClose } from "@/lib/components/dialog";
import { toast } from "sonner";
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
				<Button onClick={() => next()} type="button" disabled={!file} variant={!file ? "inverted" : "info"}>
					Next
				</Button>
			)}
			{screen == 1 && (
				<div className="flex justify-start gap-2 items-center">
					<Button
						type="button"
						disabled={!file}
						variant={!file ? "inverted" : "info"}
						onClick={() => {
							if(validateSubmission()){
								next()
							}
						}}>
						Next
					</Button>
					<Button
						type="button"
						disabled={!file}
						variant="secondary"
						onClick={() => prev()}
					>
						Previous
					</Button>
				</div>
			)}

			{screen == 2 && (
				<div className="flex justify-start gap-2 items-center">
					<Button
						type="button"
						variant={!file ? "inverted" : "info"}
						onClick={handleSubmitClick}
					>
						Submit
					</Button>
					<Button
						type="button"
						disabled={!file}
						variant="secondary"
						onClick={() => prev()}
					>
						Previous
					</Button>
				</div>
			)}

			{screen == 4 && (
				<Button
					type="button"
					variant="constructive"
					onClick={() => window.location.reload()}
				>
					Refresh
				</Button>
			)}


			<DialogClose asChild>
				<Button type="button" variant="outline">Close</Button>
			</DialogClose>
		</footer>
	);
};

export default Footer;
