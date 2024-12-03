import React from "react";

const Status = () => {
	return (
		<section className="flex-grow h-full overflow-auto p-4 w-full flex flex-col">
			<main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
				<div className="text-center">
					<h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
						Upload Finished
					</h1>
					<p className="mt-6 text-base leading-7 text-gray-600">
						Your book has been uploaded.
					</p>
				</div>
			</main>
		</section>
	);
};

export default Status;
