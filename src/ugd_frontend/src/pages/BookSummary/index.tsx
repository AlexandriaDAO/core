import React, {
	ChangeEvent,
	RefObject,
	useEffect,
	useRef,
	useState,
} from "react";
import { BsFileCheck } from "react-icons/bs";
import { IoIosGitCompare } from "react-icons/io";
import * as webllm from "@mlc-ai/web-llm";
import { IoCloudDownloadOutline } from "react-icons/io5";
import { ImSpinner2 } from "react-icons/im";

type Snippet = {
	cfi: string;
	paragraph: string;
};

enum LoadStatus {
	NotInitialized = 0,
	Initialized,
	Complete,
}

const models = [
	// {
	// 	model_url:
	// 		"https://huggingface.co/mlc-ai/Llama-2-7b-chat-hf-q4f32_1-MLC/resolve/main/",
	// 	local_id: "Llama-2-7b-chat-hf-q4f32_1",
	// 	model_lib_url:
	// 		"https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/Llama-2-7b-chat-hf/Llama-2-7b-chat-hf-q4f32_1-ctx4k_cs1k-webgpu.wasm",
	// },
	// {
	// 	model_url:
	// 		"https://huggingface.co/mlc-ai/Mistral-7B-Instruct-v0.2-q4f16_1-MLC/resolve/main/",
	// 	local_id: "Mistral-7B-Instruct-v0.2-q4f16_1",
	// 	model_lib_url:
	// 		"https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/Mistral-7B-Instruct-v0.2/Mistral-7B-Instruct-v0.2-q4f16_1-sw4k_cs1k-webgpu.wasm",
	// 	// required_features: ["shader-f16"],
	// },
	// RedPajama
	{
		model_url:
			"https://huggingface.co/mlc-ai/RedPajama-INCITE-Chat-3B-v1-q4f32_1-MLC/resolve/main/",
		local_id: "RedPajama-INCITE-Chat-3B-v1-q4f32_1",
		model_lib_url:
			"https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/RedPajama-INCITE-Chat-3B-v1/RedPajama-INCITE-Chat-3B-v1-q4f32_1-ctx2k-webgpu.wasm",
	},
];

const BookPortal = () => {
	const [snippets, setSnippets] = useState<Snippet[]>([]);
	const [drops, setDrops] = useState<Snippet[]>([]);
	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const text = e.target?.result;
				parseCsv(text as string);
			};
			reader.readAsText(file);
		}
	};
	const parseCsv = (csv: string) => {
		// const lines = csv.split('\n');
		// const result: string[][] = lines.map(line => line.split(','));
		// setCsvContent(result);
		const lines = csv.split("\n"); // Split CSV into lines
		const paragraphs = lines.map((line: string) => {
			// Split each line by the first comma found and take the second part as the snippet
			const [cfi, paragraph] = line.split(/,(.+)/);
			return {
				cfi,
				paragraph: paragraph.replace(/"/g, ""), // Remove quotation marks for display
			};
		});
		setSnippets(paragraphs);
	};

	const handleOnDrag = (e: React.DragEvent, snippet: Snippet) => {
		e.dataTransfer.setData("cfi", snippet.cfi);
	};

	const handleOnDrop = (e: React.DragEvent) => {
		const cfi = e.dataTransfer.getData("cfi") as string;
		const snippet = snippets.find((snippet) => snippet.cfi === cfi);

		const drop = drops.find((snippet) => snippet.cfi === cfi);

		if (!drop && snippet) setDrops([...drops, snippet]);
	};

	const initRef = useRef<HTMLDivElement>(null);
	const outputRef = useRef<HTMLDivElement>(null);
	// We use label to intentionally keep it simple
	const setLabel = (ref: React.RefObject<HTMLDivElement>, text: string) => {
		if (ref.current == null) {
			throw Error("Cannot find ref");
		}
		ref.current.innerText = text;
	};

	const [selectedModel, setSelectedModel] = useState<string>();
	const [model, setModel] = useState<webllm.ChatModule>();
	const [loadStatus, setLoadStatus] = useState<Number>(
		LoadStatus.NotInitialized
	);

	const loadModel = async () => {
		if (!selectedModel) {
			alert("select a model");
			return;
		}
		if (loadStatus == LoadStatus.Initialized) return;

		if (loadStatus == LoadStatus.Complete && model) return;

		setLoadStatus(LoadStatus.Initialized);

		// create a ChatModule,
		const chat = new webllm.ChatModule();

		// This callback allows us to report initialization progress
		chat.setInitProgressCallback((report: webllm.InitProgressReport) => {
			setLabel(initRef, report.text);
		});

		// // Option 1: Specify appConfig to decide what models to include
		const myAppConfig: webllm.AppConfig = {
			model_list: models,
		};
		await chat.reload(selectedModel, undefined, myAppConfig);

		// You can also try out "RedPajama-INCITE-Chat-3B-v1-q4f32_1"
		// Llama-2-7b-chat-hf-q4f32_1
		// https://github.com/mlc-ai/web-llm/blob/main/examples/simple-chat/src/gh-config.js
		// await chat.reload(selectedModel);

		setLoadStatus(LoadStatus.Complete);

		setModel(chat);
	};

	async function summarize() {
		switch (loadStatus) {
			case LoadStatus.NotInitialized:
				alert("Model not loaded");
				break;
			case LoadStatus.Initialized:
				alert("Please wait while we load the Model");
				break;
			case LoadStatus.Complete:
				if (model) {
					const allDroppedParagraphs = "";
					drops.forEach((drop, index) => {
						if (drops.length == index + 1) {
							allDroppedParagraphs + drop.paragraph + " ||| ";
						} else {
							allDroppedParagraphs + drop.paragraph;
						}
					});
					if (outputRef.current) outputRef.current.innerText = "";
					// const reply = await model.generate(
					// 	"short summary of these lines seperated by ||| : " +
					// 		allDroppedParagraphs,
					// 	(_step: number, message: string) => {
					// 		setLabel(outputRef, message);
					// 	}
					// );

					for (const drop of drops) {
						console.log("summarize this in one line: " + drop.paragraph);
						await model.generate(
							"summarize this in one line: " + drop.paragraph,
							(_step: number, message: string) => {
								setLabel(outputRef, message);
							}
						);
					}

					// const reply = await model.generate(
					// 	"can you generate a short summary of these book snippet/snippets seperated by ||| : " +
					// 		allDroppedParagraphs,
					// 	(_step: number, message: string) => {
					// 		setLabel(outputRef, message);
					// 	}
					// );

					// console.log(await model.runtimeStatsText());
				} else {
					alert("Model Not Found, Refresh Page");
				}

				break;
		}
	}

	async function compare() {
		// create a ChatModule,
		const chat = new webllm.ChatModule();
		// This callback allows us to report initialization progress
		chat.setInitProgressCallback((report: webllm.InitProgressReport) => {
			setLabel(initRef, report.text);
		});

		// You can also try out "RedPajama-INCITE-Chat-3B-v1-q4f32_1"
		// Llama-2-7b-chat-hf-q4f32_1

		// https://github.com/mlc-ai/web-llm/blob/main/examples/simple-chat/src/gh-config.js
		await chat.reload("RedPajama-INCITE-Chat-3B-v1-q4f32_1-1k", undefined, {
			model_list: [
				{
					model_url:
						"https://huggingface.co/mlc-ai/RedPajama-INCITE-Chat-3B-v1-q4f32_1-MLC/resolve/main/",
					local_id: "RedPajama-INCITE-Chat-3B-v1-q4f32_1-1k",
					model_lib_url:
						"https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/RedPajama-INCITE-Chat-3B-v1/RedPajama-INCITE-Chat-3B-v1-q4f32_1-ctx1k-webgpu.wasm",
					vram_required_MB: 2558.09,
					low_resource_required: true,
				},
			],
		});

		const allDroppedParagraphs = "";
		drops.forEach((drop, index) => {
			if (drops.length == index + 1) {
				allDroppedParagraphs + drop.paragraph + " ||| ";
			} else {
				allDroppedParagraphs + drop.paragraph;
			}
		});
		if (outputRef.current) outputRef.current.innerText = "";

		const reply = await chat.generate(
			"can you compare these paragraphs seperated by ||| : " +
				allDroppedParagraphs,
			(_step: number, message: string) => {
				setLabel(outputRef, message);
			}
		);

		console.log(await chat.runtimeStatsText());
	}
	return (
		<div className="relative h-full w-full min-h-screen p-4 font-sans">
			<div className="max-w-6xl mx-auto grid grid-cols-2 items-stretch gap-4">
				<div className="col-span-2 row-span-1 ">
					<div className="flex justify-between items-center">
						<input
							type="file"
							accept=".csv"
							onChange={handleFileChange}
						/>
						<div className="flex gap-2">
							<select
								disabled={loadStatus == LoadStatus.Initialized}
								onChange={({ target: { value } }) =>
									setSelectedModel(value)
								}
							>
								<option value="" selected>
									Choose a model
								</option>
								{models.map((model) => (
									<option value={model.local_id}>
										{model.local_id}
									</option>
								))}
							</select>
							<button
								onClick={loadModel}
								disabled={loadStatus == LoadStatus.Initialized}
								className={`px-4 py-1 transition  ${
									loadStatus == LoadStatus.Initialized
										? "bg-blue-300"
										: "bg-blue-500 hover:bg-blue-700"
								}   text-white font-bold rounded flex justify-center items-center gap-1`}
							>
								{loadStatus == LoadStatus.Initialized ? (
									<>
										Loading Model{" "}
										<ImSpinner2 className="animate-spin" />
									</>
								) : (
									<>
										Load Model <IoCloudDownloadOutline />
									</>
								)}
							</button>
						</div>
					</div>
				</div>
				<div className="col-span-2 row-span-1 " ref={initRef}></div>

				<div className="col-span-1 row-span-7 h-[70vh]">
					<div className="flex flex-col h-full overflow-y-auto justify-start items-center gap-3 p-2 border border-gray-600">
						{snippets.map((snippet, index) => (
							<div
								key={index}
								draggable
								onDragStart={(e) => handleOnDrag(e, snippet)}
								className="w-full text-base break-words text-justify bg-white shadow rounded border border-gray-400 p-2 cursor-grab"
							>
								{snippet.paragraph}
							</div>
						))}
						{snippets.length == 0 && (
							<p className="h-full flex items-center">
								Select a file to parse content.
							</p>
						)}
					</div>
				</div>
				<div className="col-span-1 row-span-3 max-h-[30vh]">
					<div
						className="h-full flex flex-col overflow-y-auto justify-start items-center gap-3 p-2 border border-gray-600"
						onDrop={handleOnDrop}
						onDragOver={(e) => e.preventDefault()}
					>
						{drops.map((drop, index) => (
							<div
								key={index}
								className="w-full text-base break-words text-justify bg-white shadow rounded border border-gray-400 p-2"
							>
								{drop.paragraph}
							</div>
						))}
						{drops.length == 0 && (
							<p className="h-full flex items-center">
								Drop some snippets here...
							</p>
						)}
					</div>
				</div>
				<div className="col-span-1 row-span-1">
					<div className="flex justify-center items-center gap-3 h-full">
						<button
							onClick={summarize}
							disabled={!model || !drops.length}
							className={`px-4 py-1 transition  ${
								!model || !drops.length
									? "bg-blue-300"
									: "bg-blue-500 hover:bg-blue-700"
							}   text-white font-bold rounded flex justify-center items-center gap-1`}
						>
							{!model ? (
								"Model Not Loaded"
							) : !drops.length ? (
								"Nothing To Summarize"
							) : (
								<>
									Summarize <BsFileCheck />
								</>
							)}
						</button>
						<button
							onClick={compare}
							className="px-4 py-1 transition  bg-blue-500 hover:bg-blue-700 text-white font-bold rounded flex justify-center items-center gap-1"
						>
							Compare <IoIosGitCompare />
						</button>
					</div>
				</div>
				<div className="col-span-1 row-span-3 max-h-[30vh]">
					<div
						ref={outputRef}
						className="h-full overflow-y-auto p-2 bg-white shadow rounded border border-gray-400"
					></div>
				</div>
			</div>
		</div>
	);
};

export default BookPortal;
