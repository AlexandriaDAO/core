import React from "react";

const Footer = ({
	screen,
	next,
	prev,
	handleSubmitClick,
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

			{screen == 3 && (
				<button
					type="button"
					onClick={() => window.location.reload()}
					className={`rounded px-3 py-1 bg-blue-700 hover:bg-blue-500 text-white focus:shadow-outline focus:outline-none`}
				>
					Refresh
				</button>
			)}
			<button
				type="button"
				onClick={handleCancel}
				className="rounded px-3 py-1 ml-auto bg-gray-800 text-white hover:bg-gray-600 focus:shadow-outline focus:outline-none"
			>
				Close
			</button>
		</footer>
	);
};

export default Footer;
