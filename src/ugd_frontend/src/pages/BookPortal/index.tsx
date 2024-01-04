import Epub, { EpubCFI } from "epubjs";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import { FaGripVertical } from "react-icons/fa";
import { FaGripHorizontal } from "react-icons/fa";

import { CSVLink } from "react-csv";
import { BsDownload } from "react-icons/bs";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MdOutlineFileDownload } from "react-icons/md";
import { Modal } from "antd";

const metadataHeaders = [
	{label: "Title", key:"title"},
	{label: "Creator", key:"creator"},
	{label: "Description", key:"description"},
	{label: "Published Date", key:"pubdate"},
	{label: "Publisher", key:"publisher"},
	{label: "Identifier", key:"identifier"},
	{label: "Language", key:"language"},
	{label: "Rights", key:"rights"},
	{label: "Modified Date", key:"modified_date"},
];

const contentHeaders = [
	{label: "cfi", key:"cfi"},
	{label: "text", key:"text"},
];

function titleToFileName(title:string) {
    return title
        .toLowerCase() // convert to lowercase
        .replace(/['"]/g, '') // remove apostrophes and quotes
        .replace(/\s+/g, '-') // replace spaces with hyphens
        .replace(/[^\w-]/g, ''); // remove any non-word (excluding hyphens) characters
}
function removeNewLines(text:string) {
	return text.replace(/\r?\n|\r/g, "");
}

const BookPortal = () => {
	const bookAreaRef = useRef(null);
	const [contents, setContents] = useState<any>([])
	const [metadata, setMetadata] = useState<any>(null)
	const [book, setBook] = useState<any>(null)
	const [file, setFile] = useState(null)
    const hiddenFileInput = useRef<HTMLInputElement>(null);
    const [view, setView] = useState('grid')
	const [bookLoadModal, setBookLoadModal] = useState(false);

	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);

	// Get a specific query parameter
	const url = queryParams.get('bookPath') || 'test.epub'
	console.log(url);
    useEffect(() => {
		try{
			if (bookAreaRef.current) {
				// Initialize the ePub reader with the book URL
				let book = Epub(url, {openAs:'epub'});

				// Render the book off-scr`een or hidden
				book.renderTo(bookAreaRef.current, {
					width: 0,
					height: 0,
				});
				setBook(book);
			}

        }catch(error){
			console.error('error',error);
		}
    }, []);

	useEffect(()=>{
		if(book){
			book.loaded.metadata.then((metadata:any) => {
				console.log("Metadata:", metadata);
				setMetadata(metadata)
			});

			book.loaded.spine.then(async (spine:any)=>{
				const contents:any = [];

				for (let item of (spine as any).items) {
					if (!item.href) return;
					const doc = await book.load(item.href);
					const innerHTML = (doc as Document).documentElement.innerHTML;
					const parsedDoc = new DOMParser().parseFromString(innerHTML, "text/html");

					const paragraphs = parsedDoc.querySelectorAll("p");

					paragraphs.forEach(paragraph => {
						const text = paragraph.textContent?.trim() ?? "";
						if (text.length < 1) return;

						const cfi = new EpubCFI(paragraph, item.cfiBase);
						const content: any = {
							cfi,
							text: removeNewLines(text)
						}
						contents.push(content);
					});
				}

				console.log('Contents', contents);
				// window.contents = contents;
				setContents(contents)
			})

		}else{
			console.log('no book');
		}
	},[book])

	const handleFileChange = (e:any) => {
		const selectedFile = e.target.files[0];
        console.log(selectedFile);
		if (selectedFile) {
		  setFile(selectedFile);
		}
	};

	useEffect(() => {
		if (file) {
			setMetadata(null);
			setContents([]);
			// Load and render the EPUB file
			const reader = new FileReader();
			reader.onload = (e) => {
				try{
					if (bookAreaRef.current && e.target?.result ) {
						// Initialize the ePub reader with the book URL
						let book = Epub(e.target?.result);

						// Render the book off-scr`een or hidden
						book.renderTo(bookAreaRef.current, {
							width: 0,
							height: 0,
						});
						setBook(book);
					}
				}catch(error){
					console.error('error',error);
				}
			};
			reader.readAsArrayBuffer(file);
		}
	}, [file]);


    const handleJSONDownload = ()=>{
        // <CSVLink filename={} headers={metadataHeaders} data={[metadata]} className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded">Export to JSON</CSVLink>

        const blob = new Blob([JSON.stringify({
            "title": metadata?.title,
            "creator": metadata?.creator,
            "description": metadata?.description,
            "pubdate": metadata?.pubdate,
            "publisher": metadata?.publisher,
            "identifier": metadata?.identifier,
            "language": metadata?.language,
            "rights": metadata?.rights,
            "modified_date": metadata?.modified_date,
        }
        )], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = titleToFileName(metadata.title) +'_MetaData.json';
        link.click();
    }
    const handleHiddenInputClick = ()=>{
        if(hiddenFileInput && hiddenFileInput.current){
            hiddenFileInput.current.click()
        }
    }
	const handleCancel = () => {
        setBookLoadModal(false);
    };

	return (
		<div className="relative h-full w-full min-h-screen p-4 font-sans">
			<div className="max-w-6xl mx-auto grid grid-cols-1 gap-4">
				<div className="col-span-3">
					<div className="flex items-center mb-4">
						<select
							name="sort"
							id="sort"
							className="w-44 text-sm text-gray-600 py-3 px-4 cursor-pointer border-r-8 border-r-transparent shadow-sm rounded focus:ring-0 focus:outline-0"
						>
							<option value="">Default sorting</option>
							<option value="price-low-to-high">
								Price low to high
							</option>
							<option value="price-high-to-low">
								Price high to low
							</option>
							<option value="latest">Latest Books</option>
						</select>

						<div className="flex gap-2 ml-auto">
							<Modal
								open={bookLoadModal}
								onCancel={handleCancel}
								footer={null}
								closable={false}
								classNames={{ content: '!p-0', }}
							>
								<main className="container mx-auto max-w-screen-lg h-full">
									{/* file upload modal */}
									<article className="relative h-full flex flex-col">
										{/* scroll area */}
										<section className="h-full overflow-auto p-8 w-full flex flex-col">
											<header className="border-dashed border-2 border-gray-400 py-12 flex flex-col justify-center items-center">
												<p className="mb-3 font-semibold text-gray-900 flex flex-wrap justify-center">
													<span>Drag and drop your</span>&nbsp;<span>files anywhere or</span>
												</p>
												<input id="hidden-input" type="file" multiple className="hidden" />
												<button id="button" className="mt-2 rounded-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 focus:shadow-outline focus:outline-none">
													Upload a file
												</button>
											</header>

											<h1 className="pt-8 pb-3 font-semibold sm:text-lg text-gray-900">
												To Upload
											</h1>

											<ul id="gallery" className="flex flex-1 flex-wrap -m-1">
												<li id="empty" className="h-full w-full text-center flex flex-col justify-center items-center">
													<img className="mx-auto w-32" src="https://user-images.githubusercontent.com/507615/54591670-ac0a0180-4a65-11e9-846c-e55ffce0fe7b.png" alt="no data" />
													<span className="text-small text-gray-500">No files selected</span>
												</li>
											</ul>
										</section>

										{/* sticky footer  */}
										<footer className="flex justify-end px-8 pb-8 pt-4">
											<button id="submit" className="rounded-sm px-3 py-1 bg-blue-700 hover:bg-blue-500 text-white focus:shadow-outline focus:outline-none">
												Upload now
											</button>
											<button id="cancel" className="ml-3 rounded-sm px-3 py-1 hover:bg-gray-300 focus:shadow-outline focus:outline-none">
												Cancel
											</button>
										</footer>
									</article>
								</main>
							</Modal>
							<button
								onClick={() => setBookLoadModal(true)}
								className="innerAuthTab border-0 text-white font-bold px-4 rounded">
								Open Modal
							</button>
							<button
								onClick={handleHiddenInputClick}
								className="innerAuthTab border-0 text-white font-bold px-4 rounded"
							>
								Load file
							</button>
							<input
								ref={hiddenFileInput}
								className="hidden"
								type="file"
								accept=".epub"
								onChange={handleFileChange}
							/>
							<FaGripVertical
								onClick={() => setView("grid")}
								className={`border w-9 h-9 p-2 flex items-center justify-center rounded cursor-pointer border-blue-500 ${
									view == "grid"
										? "text-white bg-blue-500"
										: "text-blue-500 bg-transparent"
								}`}
							/>
							<FaGripHorizontal
								onClick={() => setView("list")}
								className={`border w-9 h-9 p-2 flex items-center justify-center rounded cursor-pointer border-blue-500 ${
									view == "list"
										? "text-white bg-blue-500"
										: "text-blue-500 bg-transparent"
								}`}
							/>
						</div>
					</div>

					{view == "grid" ? (
						<div className="transition duration-300">
							<div className="grid md:grid-cols-4 grid-cols-2 gap-6">
								<div className="bg-white shadow rounded overflow-hidden  ">
									<div className="relative group">
										<img
											src="https://picsum.photos/200/200"
											alt="Book 1"
											className="w-full h-52"
										/>
										<div className="w-full h-full absolute inset-0 bg-gray-400 bg-opacity-40 opacity-0 group-hover:opacity-100 transition-all duration-500">
											<button className="absolute left-0 bottom-0 w-full p-2 bg-gray-800 text-white text-base text-center leading-4 flex items-center justify-center">
												<span className="text-white mr-1">
													<svg
														width="20"
														height="20"
														viewBox="0 0 32 32"
													>
														<path
															fill="currentColor"
															d="M16 8C7.664 8 1.25 15.344 1.25 15.344L.656 16l.594.656s5.848 6.668 13.625 7.282c.371.046.742.062 1.125.062s.754-.016 1.125-.063c7.777-.613 13.625-7.28 13.625-7.28l.594-.657l-.594-.656S24.336 8 16 8zm0 2c2.203 0 4.234.602 6 1.406A6.89 6.89 0 0 1 23 15a6.995 6.995 0 0 1-6.219 6.969c-.02.004-.043-.004-.062 0c-.239.011-.477.031-.719.031c-.266 0-.523-.016-.781-.031A6.995 6.995 0 0 1 9 15c0-1.305.352-2.52.969-3.563h-.031C11.717 10.617 13.773 10 16 10zm0 2a3 3 0 1 0 .002 6.002A3 3 0 0 0 16 12zm-8.75.938A9.006 9.006 0 0 0 7 15c0 1.754.5 3.395 1.375 4.781A23.196 23.196 0 0 1 3.531 16a23.93 23.93 0 0 1 3.719-3.063zm17.5 0A23.93 23.93 0 0 1 28.469 16a23.196 23.196 0 0 1-4.844 3.781A8.929 8.929 0 0 0 25 15c0-.715-.094-1.398-.25-2.063z"
														></path>
													</svg>
												</span>
												Quick View
											</button>
										</div>
									</div>
									<div className="py-2 px-4">
										<a href="#">
											<h4 className=" font-mono font-semibold text-md pt-1 text-gray-800 hover:text-red-500 transition">
												Author Name
											</h4>
										</a>
										<div className="flex items-baseline py-1 space-x-2 font-medium">
											<p className="text-base text-gray-800">
												$45.00
											</p>
											<p className="text-sm text-gray-400 line-through">
												$55.90
											</p>
										</div>
										<div className="flex items-center">
											<div className="flex gap-1 text-sm text-yellow-400">
												<FontAwesomeIcon
													icon={faStar}
													className="text-[#fc0]"
												/>
												<FontAwesomeIcon
													icon={faStar}
													className="text-[#fc0]"
												/>
												<FontAwesomeIcon
													icon={faStar}
													className="text-[#fc0]"
												/>
												<FontAwesomeIcon
													icon={faStar}
													className="text-[#fc0]"
												/>
												<FontAwesomeIcon
													icon={faStar}
													className="text-gray-400"
												/>
											</div>
											<div className="text-xs text-gray-500 ml-3">
												(150)
											</div>
										</div>
									</div>
									<div className="flex justify-between items-center w-full rounded text-sm font-semibold gap-2 p-2">
										<button className="px-2 py-1 rounded-tl rounded-bl transition flex-grow bg-blue-500 hover:bg-blue-700 text-white font-bold rounded flex justify-center items-center gap-1">
											{" "}
											<MdOutlineFileDownload
												size={18}
											/>{" "}
											Metadata{" "}
										</button>
										<button className="px-2 py-1 rounded-tr rounded-br transition flex-grow bg-blue-500 hover:bg-blue-700 text-white font-bold rounded flex justify-center items-center gap-1">
											{" "}
											<MdOutlineFileDownload
												size={18}
											/>{" "}
											Content{" "}
										</button>
									</div>
								</div>
							</div>

							<div className="mt-10 flex items-center justify-center gap-2.5">
								<button className="w-8 h-8 leading-8 text-lg font-semibold text-center bg-blue-500 text-white rounded">
									1
								</button>
								<button className="w-8 h-8 leading-8 text-lg font-semibold text-center border border-blue-500 text-secondary hover:text-white hover:bg-blue-500 transition duration-300 rounded">
									2
								</button>
								<button className="w-8 h-8 leading-8 text-lg font-semibold text-center border border-blue-500 text-secondary hover:text-white hover:bg-blue-500 transition duration-300 rounded">
									3
								</button>
								<button className="w-8 h-8 leading-8 text-lg font-semibold text-center border border-blue-500 text-secondary hover:text-white hover:bg-blue-500 transition duration-300 rounded">
									4
								</button>
								<button className="w-8 h-8 leading-8 text-lg font-semibold flex items-center justify-center border border-blue-500 text-secondary hover:text-white hover:bg-blue-500 transition duration-300 rounded">
									<svg
										width="15"
										height="15"
										viewBox="0 0 32 32"
									>
										<path
											fill="currentColor"
											d="M21.188 9.281L19.78 10.72L24.063 15H4v2h20.063l-4.282 4.281l1.407 1.438L27.905 16z"
										></path>
									</svg>
								</button>
							</div>
						</div>
					) : (
						<div className="transition duration-300">
							<section className="">
								<div className="flex items-start mt-6 justify-center border rounded overflow-x-auto h-auto">
									<table className="w-full text-sm text-left text-gray-500 h-full">
										<thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
											<tr>
												<th scope="col" className="py-3 px-6">Book ID</th>
												<th scope="col" className="py-3 px-6">Book Title</th>
												<th scope="col" className="py-3 px-6">Earnings</th>
												<th scope="col" className="py-3 px-6 text-center">Status</th>
												<th scope="col" className="py-3 px-6 text-center">Actions</th>
											</tr>
										</thead>
										<tbody>
											<tr className="bg-white border-b ">
												<td className="py-4 px-6">b8b21de1-da68-4310-a6fb-28cb19ff75a5</td>
												<td className="py-4 px-6">Lorem ipsum dolor sit amet.</td>
												<td className="py-4 px-6">$45</td>
												<td className="py-4 px-6">
													<div className="relative grid items-center justify-center font-sans font-bold uppercase whitespace-nowrap select-none bg-green-500/20 text-green-900 py-1 px-2 text-xs rounded-md">
														<span className="">Minted</span>
													</div>
												</td>
												<td className="py-4 px-6 flex gap-2 items-center justify-center">
													<a href="" className="hover:text-blue-500">
														<svg height="24" width="24" viewBox="0 0 24 24"
															xmlns="http://www.w3.org/2000/svg" fill="currentColor">
															<g id="SVGRepo_bgCarrier" stroke-width="0"></g>
															<g id="SVGRepo_tracerCarrier" stroke-linecap="round"
																stroke-linejoin="round"></g>
															<g id="SVGRepo_iconCarrier">
																<path
																	d="M12.5 18c-5.708 0-10.212-5.948-10.4-6.201l-.224-.299.224-.299C2.288 10.948 6.792 5 12.5 5s10.212 5.948 10.4 6.201l.224.299-.224.299C22.712 12.052 18.208 18 12.5 18zm-9.36-6.5c.98 1.188 4.85 5.5 9.36 5.5s8.38-4.312 9.36-5.5C20.88 10.312 17.01 6 12.5 6s-8.38 4.312-9.36 5.5zM12.5 8a3.5 3.5 0 1 0 3.5 3.5A3.5 3.5 0 0 0 12.5 8zm0 6a2.5 2.5 0 1 1 2.5-2.5 2.503 2.503 0 0 1-2.5 2.5z">
																</path>
																<path fill="none" d="M0 0h24v24H0z"></path>
															</g>
														</svg>
													</a>
													<a href="" className="hover:text-yellow-500">
														<svg height="22" width="22" viewBox="0 0 24 24"
															xmlns="http://www.w3.org/2000/svg" fill="currentColor">
															<g id="SVGRepo_bgCarrier" stroke-width="0"></g>
															<g id="SVGRepo_tracerCarrier" stroke-linecap="round"
																stroke-linejoin="round"></g>
															<g id="SVGRepo_iconCarrier">
																<path
																	d="M20 12.711l1-1v8.007A1.282 1.282 0 0 1 19.719 21h-8.007l1-1h7.007a.281.281 0 0 0 .281-.281zM2 3.281v16.437A1.282 1.282 0 0 0 3.281 21H4.9l.428-1H3.281A.281.281 0 0 1 3 19.719V3.28A.281.281 0 0 1 3.281 3H19.72a.281.281 0 0 1 .281.281v1.12a1.913 1.913 0 0 1 1-.173v-.947A1.281 1.281 0 0 0 19.719 2H3.28A1.281 1.281 0 0 0 2 3.281zm18.15 2.21a.965.965 0 0 1 1.386.03l1.413 1.413a.965.965 0 0 1 .03 1.385L9.826 21.471 5.73 23.227a.371.371 0 0 1-.488-.487l1.756-4.097zM9.022 20.728l-1.28-1.28-.96 2.24zM20.093 9.79L18.68 8.376 8.382 18.674l1.413 1.414zm.462-3.29l-1.169 1.17L20.8 9.083l1.152-1.151a.42.42 0 0 0 .006-.587l-.804-.838a.42.42 0 0 0-.6-.007z">
																</path>
																<path fill="none" d="M0 0h24v24H0z"></path>
															</g>
														</svg>
													</a>
													<a href="" className="hover:text-red-500">
														<svg height="22" width="22" viewBox="0 0 24 24"
															xmlns="http://www.w3.org/2000/svg" fill="currentColor">
															<g id="SVGRepo_bgCarrier" stroke-width="0"></g>
															<g id="SVGRepo_tracerCarrier" stroke-linecap="round"
																stroke-linejoin="round"></g>
															<g id="SVGRepo_iconCarrier">
																<path
																	d="M18.87 6h1.007l-.988 16.015A1.051 1.051 0 0 1 17.84 23H6.158a1.052 1.052 0 0 1-1.048-.984v-.001L4.123 6h1.003l.982 15.953a.05.05 0 0 0 .05.047h11.683zM9.5 19a.5.5 0 0 0 .5-.5v-10a.5.5 0 0 0-1 0v10a.5.5 0 0 0 .5.5zm5 0a.5.5 0 0 0 .5-.5v-10a.5.5 0 0 0-1 0v10a.5.5 0 0 0 .5.5zM5.064 5H3V4h5v-.75A1.251 1.251 0 0 1 9.25 2h5.5A1.251 1.251 0 0 1 16 3.25V4h5v1H5.064zM9 4h6v-.75a.25.25 0 0 0-.25-.25h-5.5a.25.25 0 0 0-.25.25z">
																</path>
																<path fill="none" d="M0 0h24v24H0z"></path>
															</g>
														</svg>
													</a>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
								<div className="mt-6 sm:flex sm:items-center sm:justify-between ">
									<div className="text-sm text-gray-500 ">
										Page &nbsp;
										<span className="font-medium text-gray-700 ">
											1 of 10
										</span>
									</div>

									<div className="flex items-center mt-4 gap-x-4 sm:mt-0">
										<a
											href="#"
											className="flex items-center justify-center w-1/2 px-5 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md sm:w-auto gap-x-2 hover:bg-gray-100 "
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="1.5"
												stroke="currentColor"
												className="w-5 h-5 rtl:-scale-x-100"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
												/>
											</svg>

											<span>previous</span>
										</a>

										<a
											href="#"
											className="flex items-center justify-center w-1/2 px-5 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md sm:w-auto gap-x-2 hover:bg-gray-100 "
										>
											<span>Next</span>

											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="1.5"
												stroke="currentColor"
												className="w-5 h-5 rtl:-scale-x-100"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
												/>
											</svg>
										</a>
									</div>
								</div>
							</section>
							<div className="flex items-center mt-6 text-center border rounded-lg h-auto py-10 bg-blue-200">
								<div className="flex flex-col w-full px-4 mx-auto">
									<div className="p-3 mx-auto text-blue-500 bg-blue-100 rounded-full ">
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
											stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
											<path stroke-linecap="round" stroke-linejoin="round"
												d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
										</svg>
									</div>
									<h1 className="mt-3 text-lg font-semibold text-gray-800 ">No Books found</h1>
									<p className="mt-2 text-base text-gray-500 ">You haven't uploaded any file yet. Feel free to upload an ebook. Thank You!</p>
								</div>

							</div>
						</div>
					)}
				</div>
			</div>
			<div className="max-w-6xl mx-auto grid grid-cols-1 gap-4">
				{metadata ? (
					<div className="my-2">
						<div className="flex justify-between items-center py-2">
							<h3 className="text-center">Book's metadata</h3>
							<div className="flex gap-1 justify-between items-center">
								<button
									onClick={handleJSONDownload}
									className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded"
								>
									Export to JSON
								</button>
								<CSVLink
									filename={
										titleToFileName(metadata.title) +
										"_MetaData.csv"
									}
									headers={metadataHeaders}
									data={[metadata]}
									className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded"
								>
									Export to CSV
								</CSVLink>
								{/* <CSVLink {...csvReport} className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded">Copy CSV</CSVLink>
									<CSVLink {...csvReport} className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded">Copy JSON</CSVLink> */}
							</div>
						</div>
						<table className="min-w-full leading-normal">
							<thead>
								<tr>
									<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Title
									</th>
									<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Author
									</th>
									<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Published Data
									</th>
								</tr>
							</thead>
							<tbody>
								{metadata && (
									<tr>
										<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
											{metadata.title}
										</td>
										<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
											{metadata.creator}
										</td>
										<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
											{metadata.pubdate}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				) : (
					<div className="text-center">Loading MetaData</div>
				)}
				{contents.length > 0 ? (
					<div className="my-2">
						<div className="flex justify-between items-center py-2">
							<h3 className="text-center">Book's Content</h3>
							<div className="flex gap-1 justify-between items-center">
								<CSVLink
									filename={
										titleToFileName(metadata.title) +
										"_Contents.csv"
									}
									headers={contentHeaders}
									data={contents}
									className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded"
								>
									Export to CSV
								</CSVLink>
								{/* <CSVLink {...csvReport} className="text-white bg-gradient-to-r  from-purple-500  to-blue-400 hover:from-purple-600 hover:to-blue-500 font-bold px-4 rounded">Export to CSV</CSVLink>
									<CSVLink {...csvReport} className="text-white bg-gradient-to-r  from-purple-500  to-blue-400 hover:from-purple-600 hover:to-blue-500 font-bold px-4 rounded">Export to CSV</CSVLink> */}
							</div>
						</div>
						<table className="min-w-full leading-normal">
							<thead>
								<tr>
									<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Link/CFI
									</th>
									<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Paragraph
									</th>
								</tr>
							</thead>
							<tbody>
								{contents.length > 0 &&
									contents.map(
										(content: any, index: number) => (
											<tr key={index}>
												<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
													{content.cfi.toString()}
												</td>
												<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
													{content.text}
												</td>
											</tr>
										)
									)}
							</tbody>
						</table>
					</div>
				) : (
					<div className="text-center">Loading Contents</div>
				)}
			</div>
			<div ref={bookAreaRef}></div>
		</div>
	);
}

export default BookPortal;




