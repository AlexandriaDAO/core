import React, { useEffect, useRef, useState } from "react";
import Epub from "epubjs";
import "./style.css";

const Upload = ({bookAreaRef, setBook, cover, file, setFile}:any) => {
	const hiddenFileInput = useRef<HTMLInputElement>(null);

	const handleHiddenInputClick = () => {
		if (hiddenFileInput && hiddenFileInput.current) {
			hiddenFileInput.current.click();
		}
	};

	const handleDeleteFile = () => {
        if(hiddenFileInput.current) hiddenFileInput.current.value="";
		setBook(null);
		setFile(undefined);
	};

    const handleFileChange = (e: any) => {
		const selectedFile = e.target.files[0];
		if (selectedFile) {
			setFile(selectedFile);
		}
	};


	useEffect(() => {
		if (file) {
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

	return (
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
                <input
                    ref={hiddenFileInput}
                    className="hidden"
                    type="file"
                    accept=".epub"
                    onChange={handleFileChange}
                />
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
	);
};

export default Upload;
