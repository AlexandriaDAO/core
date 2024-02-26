import { LoadStatus, useAI } from "@/contexts/AIContext";
import GetOneBook from "@/utils/GetOneBook";
import React, { useContext, useEffect, useRef, useState } from "react";
import Resizer from "react-image-file-resizer";

interface CardInterface {
	item: any;
}

const Card: React.FC<CardInterface> = ({ item }) => {
	const [compressedImageSrc, setCompressedImageSrc] = useState<string>("");
	const singleBook = GetOneBook(item.author.replace("_", " "), item.title);
	const [activeTab, setActiveTab] = useState<"text" | "summary">("text");

	const [summary, setSummary] = useState("");
	const {working, setWorking} = useAI();

	useEffect(() => {
		if (singleBook?.imagePath) {
			fetch(singleBook.imagePath)
				.then((response) => {
					if (!response.ok) {
						throw new Error("Network Response was not okay");
					}
					return response.blob();
				})
				.then((blob) => {
					Resizer.imageFileResizer(
						blob,
						300,
						300,
						"PNG",
						90,
						0,
						(uri) => {
							if (typeof uri === "string") {
								setCompressedImageSrc(uri);
							}
						},
						"base64"
					);
				})
				.catch((error) => {
					console.error(
						"There was a problem fetching the image: ",
						error
					);
					console.log("Failed image URL:", singleBook?.imagePath);
				});
		}
	}, [singleBook?.imagePath]);

	if (!item) {
		return null;
	}

	const outputRef = useRef<HTMLParagraphElement>(null);
	const { loadStatus, model } = useAI();

	async function summarize() {
        if(working) {
            alert('Model is already Working');
            return;
        }
		switch (loadStatus) {
			case LoadStatus.NotInitialized:
				alert("Model not loaded");
				break;
			case LoadStatus.Initialized:
				alert("Please wait while we load the Model");
				break;
			case LoadStatus.Complete:
				if (model) {
					setWorking(item.post_id);
					setSummary("");
					if (outputRef.current) outputRef.current.innerText = "";
					let sum = await model.generate(
						"summarize this in one line: " + item.content,
						(_step: number, message: string) => {
							if (outputRef.current == null) {
								throw Error("Cannot find ref");
							} else {
								outputRef.current.innerText = message;
							}
						}
					);
					setSummary(sum);
					setWorking(null);
				} else {
					alert("Model Not Found, Refresh Page");
				}

				break;
		}
	}
	return (
		<div className="searchedCardBx" key={item.post_id}>
			<div className="innerSaerchedCardBx">
				<div className="searchedCardimg">
					<img src={compressedImageSrc} alt="" />
				</div>
				<div className="searchecCardText">
					<div className="innerSearchedTextData flex flex-col">
						<div className="flex justify-between">
							<h2>{item.title}</h2>
							<div className="flex border-b items-end gap-2">
								<button
									disabled={working == item.post_id}
									className={`${
										working == item.post_id
											? "cursor-not-allowed"
											: "cursor-pointer"
									} py-1 px-2 text-sm font-medium ${
										activeTab === "text"
											? "border-b border-blue-500 text-blue-600"
											: "text-gray-500"
									}`}
									onClick={() => setActiveTab("text")}
								>
									Text
								</button>
								<button
									className={`py-1 px-2 text-sm font-medium ${
										activeTab === "summary"
											? "border-b border-blue-500 text-blue-600"
											: "text-gray-500"
									}`}
									onClick={() => setActiveTab("summary")}
								>
									Summary
								</button>
							</div>
						</div>
						{activeTab === "text" ? (
							<div>
								<p>{item.content} ...</p>
							</div>
						) : (
							<div className="flex-grow flex justify-center items-center">
								{working == item.post_id ? (
									<p ref={outputRef}>Thinking</p>
								) : summary ? (
									<p>{summary}</p>
								) : (
									<button
                                        disabled = {!model || working }
										className={`${!model || working ? 'bg-gray-500 cursor-not-allowed':'bg-[#00b5ad] cursor-pointer'} px-4 py-1 w-auto h-auto text-white rounded text-lg font-medium`}
										onClick={summarize}
									>
										{model ? working ? 'Model Busy':'Generate Summary' : 'Model Not Loaded'}
									</button>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Card;
