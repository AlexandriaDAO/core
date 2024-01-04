import Epub, { EpubCFI } from "epubjs";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import { CSVLink } from "react-csv";

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

const BookContent = () => {
	const bookAreaRef = useRef(null);
	const [contents, setContents] = useState<any>([])
	const [metadata, setMetadata] = useState<any>(null)
	const [book, setBook] = useState<any>(null)
	const [file, setFile] = useState(null)

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
	return (
		<div className="relative h-full w-full min-h-screen p-4 font-sans">
			<div className="text-center my-2">
				<input className="" type="file" accept=".epub" onChange={handleFileChange} />
			</div>
			<div className="max-w-6xl mx-auto grid grid-cols-1 gap-4">
				{
					metadata ?
						<div className="my-2">
							<div className="flex justify-between items-center py-2">
								<h3 className="text-center">Book's metadata</h3>
								<div className="flex gap-1 justify-between items-center">
									<CSVLink filename={titleToFileName(metadata.title) +'_MetaData.csv'} headers={metadataHeaders} data={[metadata]} className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded">Export to CSV</CSVLink>
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
						</div>:
						<div className="text-center">Loading MetaData</div>
				}
				{
					contents.length>0 ?
						<div className="my-2">
							<div className="flex justify-between items-center py-2">
								<h3 className="text-center">Book's Content</h3>
								<div className="flex gap-1 justify-between items-center">
									<CSVLink filename={titleToFileName(metadata.title) +'_Contents.csv'} headers={contentHeaders} data={contents} className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded">Export to CSV</CSVLink>
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
									{contents.length>0 && contents.map((content:any, index:number)=>(
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
						</div>:
						<div className="text-center">Loading Contents</div>
				}
			</div>
			<div ref={bookAreaRef}></div>
		</div>
	);
}

export default BookContent;




