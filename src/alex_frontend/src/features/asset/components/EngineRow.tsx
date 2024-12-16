// will be reused


// import React, { useCallback, useEffect, useState } from "react";
// import { toast } from "sonner";
// import { Check, Info, LoaderCircle, Plus } from "lucide-react";
// import { getAllDocumentsByManifest } from "@/features/engine-books/utils/utilities";
// import { Book } from "@/features/portal/portalSlice";
// import MeiliSearch, { Index } from "meilisearch";
// import { initializeClient, initializeIndex } from "@/services/meiliService";
// import Epub, { EpubCFI } from "epubjs";
// import { v4 as uuidv4 } from "uuid";
// import { EnqueuedTask } from "meilisearch";
// import { waitForTaskCompletion } from "@/services/meiliService";
// import { Button } from "@/lib/components/button";
// import { SerializedEngine } from "@/features/my-engines/myEnginesSlice";

// const EngineRow: React.FC<{
// 	engine: SerializedEngine;
// 	book: Book;
// }> = ({ engine, book }) => {
// 	if(!engine || !book) return <></>;

// 	const [meiliClient, setMeiliClient] = useState<MeiliSearch>();
// 	const [meiliIndex, setMeiliIndex] = useState<Index>();

// 	const [added, setAdded] = useState<boolean|undefined>(undefined);
// 	const [error, setError] = useState<string>('');

// 	const checkIfAdded = useCallback(async () => {
// 		if (!meiliClient) {
// 			toast.error('Client not available')
// 			return
// 		};
// 		if (!meiliIndex) {
// 			toast.error('Index not available')
// 			return
// 		};

// 		const documents = await getAllDocumentsByManifest(
// 			meiliIndex,
// 			book.manifest
// 		);

// 		if (documents.length > 0) {
// 			setAdded(true);
// 			return;
// 		}

// 		setAdded(false);
// 	}, [book.manifest, meiliClient, meiliIndex, setAdded]);

// 	useEffect(() => {
// 		if(!meiliIndex) return;

// 		checkIfAdded();
// 	}, [meiliIndex, checkIfAdded]);


// 	const initializeMeiliClient = async () => {
// 		const client = await initializeClient(engine.host, engine.key);

// 		if(!client){
// 			setError('Client not available')
// 			return;
// 		}

// 		setMeiliClient(client);

// 		const index = await initializeIndex(client, engine.index);

// 		if(!index){
// 			setError('Index not available')
// 			return;
// 		}

// 		setMeiliIndex(index)
// 	}

// 	useEffect(() => {
// 		initializeMeiliClient();
// 	}, []);


// 	const handleAddBook = async () => {
// 		if (!meiliClient) {
// 			toast.error('Client not available')
// 			return
// 		};
// 		if (!meiliIndex) {
// 			toast.error('Index not available')
// 			return
// 		};

// 		let contents: any = [];

// 		try {
// 			setAdded(undefined);

// 			toast.info("Converting Epub to JSON");

// 			const onlineBook = Epub(`https://gateway.irys.xyz/${book.manifest}/book`, {
// 				openAs: "epub",
// 			});

// 			// Fetch spine items
// 			const spine = await onlineBook.loaded.spine;
// 			//@ts-ignore
// 			for (let item of spine.items) {
// 				if (!item.href) continue;
// 				const doc = await onlineBook.load(item.href);
// 				//@ts-ignore
// 				const innerHTML = doc.documentElement.innerHTML;
// 				const parsedDoc = new DOMParser().parseFromString(
// 					innerHTML,
// 					"text/html"
// 				);
// 				const paragraphs = parsedDoc.querySelectorAll("p");

// 				paragraphs.forEach((paragraph) => {
// 					const text = paragraph.textContent?.trim() ?? "";
// 					if (text.length < 1) return;
// 					const cfi = new EpubCFI(paragraph, item.cfiBase).toString();
// 					const id = uuidv4();

// 					contents.push({
// 						id,
// 						cfi,
// 						text,

// 						...book
// 					});
// 				});
// 			}
// 			toast.success("Conversion Successfull");

// 			toast.info("Storing JSON docs to Engine");

// 			const task: EnqueuedTask = await meiliIndex.addDocuments(contents, { primaryKey: "id" });

// 			toast.info("Documents enqueued for addition.");

// 			await waitForTaskCompletion(meiliClient, task.taskUid);

// 			toast.success("Stored Successfully");

// 			setAdded(true);
// 		} catch (err) {
// 			toast.error("Error while adding Book to engine: " + err);
// 			setAdded(false);
// 		}
// 	};

// 	const renderActionButton = () => {
// 		if (error) {
// 			return (
// 				<Button
// 					title={error}
// 					disabled={true}
// 					variant="destructive"
// 					rounded="full"
// 					scale="icon"
// 					className="p-0"
// 				>
// 					<Info size={26}/>
// 				</Button>
// 			);
// 		}

// 		if (added === undefined) {
// 			return (
// 				<Button
// 					variant="link"
// 					scale="icon"
// 					rounded="full"
// 					className="pointer-events-none"
// 				>
// 					<LoaderCircle size={18} className="animate-spin" />
// 				</Button>
// 			);
// 		}

// 		if (added) {
// 			return (
// 				<Button
// 					onClick={() => toast.success('Book is already Added.')}
// 					variant="link"
// 					scale="icon"
// 					rounded="full"
// 				>
// 					<Check size={18} />
// 				</Button>
// 			);
// 		}

// 		return (
// 			<Button
// 				onClick={handleAddBook}
// 				variant="link"
// 				scale="icon"
// 				rounded="full"
// 			>
// 				<Plus size={18} />
// 			</Button>
// 		);
// 	};

// 	return (
// 		<tr key={engine.id}>
// 			<td className="p-2">{Number(engine.id)}</td>
// 			<td className="p-2">{engine.owner.toString().slice(0, 5) + "..." + engine.owner.toString().slice(-3)}</td>
// 			<td className="p-2 flex items-center justify-center gap-1">
// 				{renderActionButton()}
// 			</td>
// 		</tr>
// 	)
// };

// export default EngineRow;