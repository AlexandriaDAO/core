import React from "react";

const MetaData = ({metadata, setMetadata}:any) => {
	return (
		<section className="flex-grow h-full overflow-auto p-4 w-full flex flex-col text-sm gap-2 items-start justify-start">
			<div className="flex flex-col gap-1 w-full justify-between items-start">
				<label htmlFor="title">Title</label>
				<input
					className="w-full py-1 px-2 placeholder-gray-600 border border-gray-800 rounded focus:shadow-outline"
					type="text"
					id="title"
					placeholder="Book Title"
					value={metadata?.title}
					onChange={(e) =>
						setMetadata({
							...metadata,
							title: e.target.value,
						})
					}
				/>
			</div>
			<div className="flex flex-col gap-1 w-full justify-between items-start">
				<label htmlFor="creator">Author</label>
				<input
					className="w-full py-1 px-2 placeholder-gray-600 border border-gray-800 rounded focus:shadow-outline"
					type="text"
					id="author"
					placeholder="Author"
					value={metadata?.creator}
					onChange={(e) =>
						setMetadata({
							...metadata,
							author: e.target.value,
						})
					}
				/>
			</div>

			<div className="flex flex-col gap-1 w-full justify-between items-start">
				<label htmlFor="publisher">Publisher</label>
				<input
					className="w-full py-1 px-2 placeholder-gray-600 border border-gray-800 rounded focus:shadow-outline"
					type="text"
					id="publisher"
					placeholder="Publisher"
					value={metadata?.publisher}
					onChange={(e) =>
						setMetadata({
							...metadata,
							publisher: e.target.value,
						})
					}
				/>
			</div>
			<div className="flex flex-col gap-1 w-full justify-between items-start">
				<label htmlFor="pubdate">Published Date</label>
				<input
					className="w-full py-1 px-2 placeholder-gray-600 border border-gray-800 rounded focus:shadow-outline"
					type="text"
					id="pubdate"
					placeholder="Published Date"
					value={metadata?.pubdate}
					onChange={(e) =>
						setMetadata({
							...metadata,
							pubdate: e.target.value,
						})
					}
				/>
			</div>
			<div className="flex flex-col gap-1 w-full justify-between items-start">
				<label htmlFor="identifier">Identifier</label>
				<input
					className="w-full py-1 px-2 placeholder-gray-600 border border-gray-800 rounded focus:shadow-outline"
					type="text"
					id="identifier"
					placeholder="Identifier"
					value={metadata?.identifier}
					onChange={(e) =>
						setMetadata({
							...metadata,
							identifier: e.target.value,
						})
					}
				/>
			</div>
			<div className="flex flex-col gap-1 w-full justify-between items-start">
				<label htmlFor="language">Language</label>
				<input
					className="w-full py-1 px-2 placeholder-gray-600 border border-gray-800 rounded focus:shadow-outline"
					type="text"
					id="language"
					placeholder="Language"
					value={metadata?.language}
					onChange={(e) =>
						setMetadata({
							...metadata,
							language: e.target.value,
						})
					}
				/>
			</div>
			<div className="flex flex-col gap-1 w-full justify-between items-start">
				<label htmlFor="rights">Rights</label>
				<input
					className="w-full py-1 px-2 placeholder-gray-600 border border-gray-800 rounded focus:shadow-outline"
					type="text"
					id="rights"
					placeholder="Rights"
					value={metadata?.rights}
					onChange={(e) =>
						setMetadata({
							...metadata,
							rights: e.target.value,
						})
					}
				/>
			</div>
			<div className="flex flex-col gap-1 w-full justify-between items-start">
				<label htmlFor="modified_date">Modified Date</label>
				<input
					className="w-full py-1 px-2 placeholder-gray-600 border border-gray-800 rounded focus:shadow-outline"
					type="text"
					id="modified_date"
					placeholder="Modified Date"
					value={metadata?.modified_date}
					onChange={(e) =>
						setMetadata({
							...metadata,
							modified_date: e.target.value,
						})
					}
				/>
			</div>
			<div className="flex flex-col gap-1 w-full justify-between items-start">
				<label htmlFor="description">Description</label>
				<textarea
					onChange={(e) =>
						setMetadata({
							...metadata,
							description: e.target.value,
						})
					}
					className="w-full py-1 px-2 placeholder-gray-600 border border-gray-800 rounded focus:shadow-outline"
					name="description"
					id="description"
					placeholder="Description"
				></textarea>
			</div>
		</section>
	);
};

export default MetaData;
