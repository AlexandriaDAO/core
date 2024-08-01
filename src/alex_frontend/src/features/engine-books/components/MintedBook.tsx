import React, { useCallback, useEffect, useState } from "react";
import { IoIosArrowDown, IoIosArrowUp, IoIosSearch } from "react-icons/io";
import { RxCross1 } from "react-icons/rx";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { TokenDetail } from "../../../../../../src/declarations/alex_backend/alex_backend.did";
import { getSingleIrysBooks } from "@/utils/irys";
import { getCover } from "@/utils/epub";
import { CiCirclePlus } from "react-icons/ci";
import useSession from "@/hooks/useSession";
import { message } from "antd";
import { getAllDocumentsByAssetId } from "../utils/utilities";
import { EnqueuedTask } from "meilisearch";
import { waitForTaskCompletion } from "@/services/meiliService";
import Epub, { EpubCFI } from "epubjs";
import { v4 as uuidv4 } from "uuid";
import { ImSpinner8 } from "react-icons/im";
import { Book } from "@/components/BookModal";

interface MintedBookProps {
	token: TokenDetail;
}

const MintedBook: React.FC<MintedBookProps> = ({ token }) => {
	const { meiliClient } = useSession();
	const { activeEngine } = useAppSelector((state) => state.engineOverview);
	const { user } = useAppSelector((state) => state.auth);

	const [book, setBook] = useState<Book>({
		id: "",
		title: "loading...",
		author: "loading...",
		cover: "",
		tags: [],
	});

	const populateBook = useCallback(async () => {
		if (!token.description) return;

		try {
			const loadedBook = await getSingleIrysBooks(token.description);

			setBook(loadedBook);
		} catch (error) {
			console.error("Error populating Book:", error);
		}
	}, [token]);

	useEffect(() => {
		populateBook();
	}, [populateBook]);

	const extractCover = useCallback(async () => {
		if (!book.id || book.cover !== "") return; // If cover is not empty, we've already fetched it

		try {
			const coverUrl = await getCover(
				`https://gateway.irys.xyz/${book.id}`
			);

			if (!coverUrl) throw new Error("Cover not available");

			setBook({ ...book, cover: coverUrl });
		} catch (error) {
			console.error("Error fetching cover URL:", error);
		}
	}, [book.id, book.cover]);

	useEffect(() => {
		extractCover();
	}, [extractCover]);

	const [added, setAdded] = useState(false);
	const [processing, setProcessing] = useState(true);

	const checkIfAdded = useCallback(async () => {
		if (!book.id || !meiliClient || !activeEngine) return;

		const documents = await getAllDocumentsByAssetId(
			meiliClient.index(activeEngine),
			book.id
		);

		if (documents.length > 0) {
			setAdded(true);
		}

		setProcessing(false);
	}, [book.id]);

	useEffect(() => {
		checkIfAdded();
	}, [checkIfAdded]);

	const handleRemoveBook = async () => {
		if (!book.id || !meiliClient || !activeEngine) return;

		try {
			setProcessing(true);

			const documents = await getAllDocumentsByAssetId(
				meiliClient.index(activeEngine),
				book.id
			);

			if (documents.length === 0) {
				throw new Error("No documents found with for this asset id");
			}

			const documentIds = documents.map((doc: any) => doc.id);
			const task: EnqueuedTask = await meiliClient
				.index(activeEngine)
				.deleteDocuments(documentIds);

			message.info("Documents enqueued for deletion.");

			await waitForTaskCompletion(meiliClient, task.taskUid);

			message.success("Documents deleted successfully.");

			console.log(
				`Deleted ${documentIds.length} documents with asset id: ${book.id}`
			);

			setAdded(false);
		} catch (error) {
			message.error("Failed to remove book.");

			console.error("Error deleting documents from Meilisearch:", error);
		} finally {
			setProcessing(false);
		}
	};

	const handleAddBook = async () => {
		if (!book.id || !meiliClient || !activeEngine) return;

		let contents: any = [];

		try {
			setProcessing(true);

			message.info("Converting Epub to JSON");

			const onlineBook = Epub(`https://gateway.irys.xyz/${book.id}`, {
				openAs: "epub",
			});

			// Fetch spine items
			const spine = await onlineBook.loaded.spine;
			//@ts-ignore
			for (let item of spine.items) {
				if (!item.href) continue;
				const doc = await onlineBook.load(item.href);
				//@ts-ignore
				const innerHTML = doc.documentElement.innerHTML;
				const parsedDoc = new DOMParser().parseFromString(
					innerHTML,
					"text/html"
				);
				const paragraphs = parsedDoc.querySelectorAll("p");

				paragraphs.forEach((paragraph) => {
					const text = paragraph.textContent?.trim() ?? "";
					if (text.length < 1) return;
					const cfi = new EpubCFI(paragraph, item.cfiBase).toString();
					const id = uuidv4();
					// {
					//     title: '1984',
					//     fiction: false,
					//     language: 'en',
					//     author_first: 'George',
					//     author_last: 'Orwell',
					//     type: 9,
					//     type0: '1',
					//     type1: '0',
					//     type2: '0',
					//     type3: '1',
					//     type4: '1',
					//     type5: '0',
					//     type6: '0',
					//     type7: '0',
					//     type8: '0',
					//     type9: '0',
					//     era: 14
					// }

					contents.push({
						id,
						cfi,
						text,

                        title: book.title,
						fiction: book.tags.find((tag) => tag.name == "fiction")?.value ?? false,
                        language: book.tags.find((tag)=> tag.name == "language")?.value ?? '',
                        author_first: book.tags.find((tag)=> tag.name == "author_first")?.value ?? '',
                        author_last: book.tags.find((tag)=> tag.name == "author_last")?.value ?? '',
                        type: book.tags.find((tag)=> tag.name == "type")?.value ?? 0,
                        era: book.tags.find((tag)=> tag.name == "era")?.value ?? 1,
						asset_id: book.id,
					});
				});
			}
			message.success("Conversion Successfull");

			message.info("Storing JSON docs to Engine");

			const task: EnqueuedTask = await meiliClient
				.index(activeEngine)
				.addDocuments(contents, { primaryKey: "id" });

			message.info("Documents enqueued for addition.");

			await waitForTaskCompletion(meiliClient, task.taskUid);

			message.success("Stored Successfully");

			setAdded(true);
		} catch (err) {
			message.error("Error while adding Book to engine: " + err);
		} finally {
			setProcessing(false);
		}
	};

	return (
		<div className="flex justify-between gap-2 items-stretch text-black bg-[#F4F4F4] rounded-lg p-2">
			<img
				className={`rounded-lg h-12 w-12 object-fill ${
					!book.cover && "animate-pulse"
				}`}
				src={book.cover || "images/default-cover.jpg"}
				alt={book.title}
				onError={() => console.error("Error loading image for " + book)}
			/>
			<div className="flex-grow flex flex-col justify-between">
				<div className="flex justify-start items-center gap-1">
					<span className="font-roboto-condensed text-base leading-[18px] font-normal">
						Author :
					</span>
					<span className="font-roboto-condensed text-base leading-[18px] font-medium ">
						{book.author}
					</span>
				</div>
				<div className="flex justify-start items-center gap-1">
					<span className="font-roboto-condensed text-base leading-[18px] font-normal">
						Title :
					</span>
					<span className="font-roboto-condensed text-base leading-[18px] font-medium ">
						{book.title}
					</span>
				</div>
			</div>
			{user === token.owner && (
				<div className="flex gap-2 align-center justify-between self-center">
					{processing ? (
						<button
							disabled
							className="cursor-not-allowed opacity-50 flex justify-center items-center gap-1 px-2 py-1 bg-black rounded text-[#F6F930] font-medium font-roboto-condensed text-base"
						>
							<span>Waiting...</span>
							<ImSpinner8
								size={14}
								className="animate animate-spin"
							/>
						</button>
					) : added ? (
						<button
							onClick={handleRemoveBook}
							className="flex justify-center items-center gap-1 px-2 py-1 bg-black rounded cursor-pointer text-[#F6F930] hover:text-yellow-100 font-medium font-roboto-condensed text-base"
						>
							<span>Remove From Engine</span>
						</button>
					) : (
						<button
							onClick={handleAddBook}
							className="flex justify-center items-center gap-1 px-2 py-1 bg-black rounded cursor-pointer text-[#F6F930] hover:text-yellow-100 font-medium font-roboto-condensed text-base"
						>
							<span>Add To Engine</span>
						</button>
					)}
				</div>
			)}
		</div>
	);
};

export default MintedBook;
