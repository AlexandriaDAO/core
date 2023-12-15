import Epub, { EpubCFI } from "epubjs";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const BookContent = () => {
	const bookAreaRef = useRef(null);
	const [contents, setContents] = useState<any>([])
	const [metadata, setMetadata] = useState<any>(null)
	const [book, setBook] = useState<any>(null)

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

				// Render the book off-screen or hidden
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
							text
						}  
						contents.push(content);
					});
				}

				console.log('Contents', contents);
				setContents(contents)
			})

		}else{
			console.log('no book');
		}
	},[book])

	return (
		<div className="relative h-full w-full min-h-screen p-4">
			<div className="max-w-6xl mx-auto grid grid-cols-1 gap-4">
				{
					metadata ? 
						<>
							<h3 className="text-center">Book's metadata</h3>
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
						</>:
						<div className="text-center">Loading MetaData</div>
				}
				{
					contents.length>0 ? 
						<>
							<h3 className="text-center">Book's Content</h3>
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
						</>:
						<div className="text-center">Loading Contents</div>
				}
			</div>
			<div ref={bookAreaRef}></div>
		</div>
	);
}

export default BookContent;




