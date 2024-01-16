import React, { useEffect, useRef, useState } from "react";
import { Button, Modal, Steps, message } from "antd";
import Epub, { EpubCFI } from "epubjs";
import "./style.css";
import { initJuno, setDoc, uploadFile } from "@junobuild/core";
import { nanoid } from "nanoid";
import { LoadingOutlined} from '@ant-design/icons';

const metadataHeaders = [
	{ label: "Title", key: "title" },
	{ label: "Creator", key: "creator" },
	{ label: "Description", key: "description" },
	{ label: "Published Date", key: "pubdate" },
	{ label: "Publisher", key: "publisher" },
	{ label: "Identifier", key: "identifier" },
	{ label: "Language", key: "language" },
	{ label: "Rights", key: "rights" },
	{ label: "Modified Date", key: "modified_date" },
];

const contentHeaders = [
	{ label: "cfi", key: "cfi" },
	{ label: "text", key: "text" },
];

const BookUpload = () => {
	const [bookLoadModal, setBookLoadModal] = useState(false);

	const [file, setFile] = useState<File | undefined>(undefined);
	const hiddenFileInput = useRef<HTMLInputElement>(null);

	const bookAreaRef = useRef(null);
	const [contents, setContents] = useState<any>([]);
	const [metadata, setMetadata] = useState<any>(null);
	const [cover, setCover] = useState<any>(null);
	const [book, setBook] = useState<any>(null);


	const[ uploadStatus, setUploadStatus] = useState(0)

	const [current, setCurrent] = useState(0);

	const next = (step:any = null) => {
		if(step){
			setCurrent(step);
		}else{
			setCurrent(current + 1);
		}
	};

	const prev = () => {
		setCurrent(current - 1);
	};

	const handleCancel = () => {
		setBookLoadModal(false);
	};
	const handleHiddenInputClick = () => {
		if (hiddenFileInput && hiddenFileInput.current) {
			hiddenFileInput.current.click();
		}
	};

	const handleFileChange = (e: any) => {
		const selectedFile = e.target.files[0];
		if (selectedFile) {
			setFile(selectedFile);
		}
	};
	const handleDeleteFile = () => {
        if(hiddenFileInput.current) hiddenFileInput.current.value="";
		setContents([]);
		setMetadata(null);
		setCover(null);
		setBook(null);

		setFile(undefined);
	};
	useEffect(() => {
		if (book) {
			setMetadata(null);
			book.loaded.metadata.then((metadata: any) => {
				setMetadata({
                    "title": metadata?.title,
                    "creator": metadata?.creator,
                    "description": metadata?.description,
                    "pubdate": metadata?.pubdate,
                    "publisher": metadata?.publisher,
                    "identifier": metadata?.identifier,
                    "language": metadata?.language,
                    "rights": metadata?.rights,
                    "modified_date": metadata?.modified_date,
                });
			});
            setCover(null);
			book.loaded.cover.then((coverPath: string) => {
				book.archive.createUrl(coverPath).then((url: string) => {

                    setCover(url)

					// fetch(blobUrl)
					// 	.then((response) => response.blob())
					// 	.then((blob: Blob) => {
					// 		const reader = new FileReader();
					// 		reader.readAsDataURL(blob);
					// 		reader.onloadend = () => {
					// 			const base64data = reader.result as string;
					// 			setCover({blobUrl, blobData: base64data});
					// 		};
					// 	});
				});
			});

			setContents([]);
			book.loaded.spine.then(async (spine: any) => {
				const contents: any = [];

				for (let item of (spine as any).items) {
					if (!item.href) return;
					const doc = await book.load(item.href);
					const innerHTML = (doc as Document).documentElement
						.innerHTML;
					const parsedDoc = new DOMParser().parseFromString(
						innerHTML,
						"text/html"
					);

					const paragraphs = parsedDoc.querySelectorAll("p");

					paragraphs.forEach((paragraph) => {
						const text = paragraph.textContent?.trim() ?? "";
						if (text.length < 1) return;

						const cfi = new EpubCFI(paragraph, item.cfiBase);
						const content: any = {
							cfi,
							text: text.replace(/\r?\n|\r/g, ""), //remove new lines
						};
						contents.push(content);
					});
				}
				setContents(contents);
			});
		} else {
			console.log("no book");
		}
	}, [book]);
	useEffect(() => {
		if (file) {
			console.log(file);
			setBook(null);
			// Load and render the EPUB file
			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					if (bookAreaRef.current && e.target?.result) {
						// Initialize the ePub reader with the book URL
						let book = Epub(e.target?.result);

						// Render the book off-scr`een or hidden
						book.renderTo(bookAreaRef.current, {
							width: 0,
							height: 0,
						});
						setBook(book);
					}
				} catch (error) {
					console.error("error", error);
				}
			};
			reader.readAsArrayBuffer(file);
		}
	}, [file]);

	const [drag, setDrag] = useState(0);

	const handleDragEnter = (e: React.DragEvent) => {
		e.preventDefault();
		setDrag((prev) => prev + 1);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault(); // Necessary to allow for drop
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setDrag((prev) => prev - 1);
	};
	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDrag(0);
		const selectedFile = e.dataTransfer.files[0];
		if (selectedFile) {
			setFile(selectedFile);
		}
	};

	const handleSubmitClick = async () => {
		next();

        let url = undefined;
		try {
			setUploadStatus(1);
			if (!file) return;

            message.info("Storing Book");

            // max upload size is 10mb 10000000bytes
            const { downloadUrl } = await uploadFile({
                collection: "uploads",
                data: file,
                filename: `${nanoid()}-${Date.now()}-book-${file.name}`,
            });

            message.success("Book Stored Successfully");

            url = downloadUrl;
			setUploadStatus(2);
        } catch (err) {
            message.error("Error Storing Book: " + err);
			next();
            return;
		}

        try {
			setUploadStatus(3);
            message.info("Storing MetaData");
            await setDoc({
                collection: "books",
                doc: {
                    key: nanoid(),
                    data: {
                        ...metadata,
                        ...(url !== undefined && { url }),
                    },
                },
            });

            message.success("MetaData Stored Successfully");
			setUploadStatus(4)
        } catch (err) {
            message.error("Error Storing MetaData: " + err);
        }

		setTimeout(()=>{
			next(3);
		}, 2000)

	};

	return (
		<>
			<button
				onClick={() => setBookLoadModal(true)}
				className="innerAuthTab border-0 text-white font-bold px-4 rounded"
			>
				Mint NFT
			</button>
			<input
				ref={hiddenFileInput}
				className="hidden"
				type="file"
				accept=".epub"
				onChange={handleFileChange}
			/>
			<Modal
				open={bookLoadModal}
				onCancel={handleCancel}
				footer={null}
				closable={false}
				className="min-w-[600px]"
				// classNames={{ content: '!p-0', }}
			>
				<main className="container h-full w-full flex flex-col flex-grow justify-between">
					<header className="p-4">
						<Steps
							current={current}
							items={[
								{ title: "Upload File" },
								{ title: "Metadata" },
								{ title: "Processing" },
								{ title: "Success" },
							]}
						/>
					</header>

					{/* file upload modal */}

					{current == 0 && (
						<section className="flex-grow h-full overflow-auto p-4 w-full flex flex-col">
							<header
								className={`border-dashed border-2 ${
									drag !== 0
										? "border-blue-500 bg-blue-100"
										: "border-gray-400"
								} py-12 flex flex-col justify-center items-center`}
								onDragOver={handleDragOver}
								onDragEnter={handleDragEnter}
								onDragLeave={handleDragLeave}
								onDrop={handleDrop}
							>
								<p className="mb-3 font-semibold text-gray-900 flex flex-wrap justify-center">
									<span>Drag and drop your</span>
									&nbsp;
									<span>files anywhere or</span>
								</p>
								<button
									onClick={handleHiddenInputClick}
									className="mt-2 rounded-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 focus:shadow-outline focus:outline-none"
								>
									Upload a file
								</button>
								{drag !== 0 && (
									<div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center">
										<p className="text-white text-lg">
											Drop the files here...
										</p>
									</div>
								)}
							</header>

							<h1 className="pt-8 pb-3 font-semibold sm:text-lg text-gray-900">
								To Upload
							</h1>

							<div className="flex flex-1 flex-wrap">
								<div ref={bookAreaRef}></div>
								{file ? (
									<div className="block p-1 w-full h-48">
										<article className="group hasImage w-full h-full rounded-md focus:outline-none focus:shadow-outline bg-gray-100 cursor-pointer relative text-transparent hover:text-white shadow-sm">
											{cover && (
												<img
													alt={file.name}
													className="img-preview w-full h-full sticky object-cover rounded-md bg-fixed"
													src={cover}
												/>
											)}
											<section className="flex flex-col rounded-md text-xs break-words w-full h-full z-20 absolute top-0 py-2 px-3">
												<h1 className="flex-1">
													{file.name}
												</h1>
												<div className="flex">
													<span className="p-1">
														<svg
															className="pointer-events-none fill-current w-4 h-4 ml-auto"
															xmlns="http://www.w3.org/2000/svg"
															width="24"
															height="24"
															viewBox="0 0 24 24"
														>
															<rect
																x="2"
																y="2"
																width="14"
																height="20"
																fill="none"
																stroke="currentColor"
																strokeWidth="1"
															/>
															<line
																x1="4"
																y1="4"
																x2="12"
																y2="4"
																stroke="currentColor"
																strokeWidth="1"
															/>
															<line
																x1="4"
																y1="8"
																x2="12"
																y2="8"
																stroke="currentColor"
																strokeWidth="1"
															/>
															<line
																x1="4"
																y1="12"
																x2="12"
																y2="12"
																stroke="currentColor"
																strokeWidth="1"
															/>
															<line
																x1="18"
																y1="3"
																x2="18"
																y2="21"
																stroke="currentColor"
																strokeWidth="1"
															/>
															<line
																x1="17"
																y1="6"
																x2="19"
																y2="6"
																stroke="currentColor"
																strokeWidth="1"
															/>
															<line
																x1="17"
																y1="12"
																x2="19"
																y2="12"
																stroke="currentColor"
																strokeWidth="1"
															/>
															<line
																x1="17"
																y1="18"
																x2="19"
																y2="18"
																stroke="currentColor"
																strokeWidth="1"
															/>
														</svg>
													</span>
													<p className="p-1 size text-xs">
														Size:
														{file.size > 1024
															? file.size >
															  1048576
																? Math.round(
																		file.size /
																			1048576
																  ) + "mb"
																: Math.round(
																		file.size /
																			1024
																  ) + "kb"
															: file.size + "b"}
													</p>
													<button
														onClick={
															handleDeleteFile
														}
														className="delete ml-auto focus:outline-none hover:bg-gray-300 p-1 rounded-md"
													>
														<svg
															className="pointer-events-none fill-current w-4 h-4 ml-auto"
															xmlns="http://www.w3.org/2000/svg"
															width="24"
															height="24"
															viewBox="0 0 24 24"
														>
															<path
																className="pointer-events-none"
																d="M3 6l3 18h12l3-18h-18zm19-4v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.316c0 .901.73 2 1.631 2h5.711z"
															></path>
														</svg>
													</button>
												</div>
											</section>
										</article>
									</div>
								) : (
									<div className="h-full w-full text-center flex flex-col justify-center items-center">
										<img
											className="mx-auto w-32"
											src="https://user-images.githubusercontent.com/507615/54591670-ac0a0180-4a65-11e9-846c-e55ffce0fe7b.png"
											alt="no data"
										/>
										<span className="text-small text-gray-500">
											No files selected
										</span>
									</div>
								)}
							</div>
						</section>
					)}

					{current == 1 && (
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
								<label htmlFor="modified_date">
									Modified Date
								</label>
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
					)}

					{current == 2 && (
						<section className="flex-grow h-full overflow-auto p-4 w-full flex flex-col">
							<main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
								<Steps
									direction="vertical"
									size="small"
									current={uploadStatus}
									items={[
										{ title: 'Uploading File',  description: "Your book is being uploaded to secure server" , status : uploadStatus == 0 ? 'wait' : uploadStatus == 1 ? 'process' : uploadStatus > 1 ? 'finish' : 'error', icon: uploadStatus == 1 ? <LoadingOutlined />:'' } ,
										{ title: 'Uploading Metadata', description: "Storing metadata of the uploaded Book" , status : uploadStatus < 3 ? 'wait' : uploadStatus == 3 ? 'process' : uploadStatus > 3 ? 'finish' : 'error', icon: uploadStatus == 3 ? <LoadingOutlined />:'' },
										{ title: 'Upload Success', description: "Your data has been saved successfully" , status : uploadStatus < 4 ? 'wait' : 'finish' },
									]}
								/>
							</main>
						</section>
					)}

					{current == 3 && (
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
					)}

					{/* sticky footer  */}
					<footer className="flex justify-between items-center p-4 gap-2">
						{current == 0 && (
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
						{current == 1 && (
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

						{current == 3 && (
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
				</main>
			</Modal>
		</>
	);
};

export default BookUpload;
