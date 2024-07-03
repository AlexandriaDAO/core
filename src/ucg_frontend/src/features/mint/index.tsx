import React, { useEffect, useRef, useState } from "react";
import { Modal, message } from "antd";
// import { setDoc, uploadFile } from "@junobuild/core";
// import { nanoid } from "nanoid";
import Upload from "./Upload";
import MetaData from "./MetaData";
import Processing from "./Processing";
import Status from "./Status";
import Footer from "./Footer";
import Header from "./Header";
import useSession from "@/hooks/useSession";
import getIrys from "../irys/utils/getIrys";
import { readFileAsBuffer } from "../irys/utils/gaslessFundAndUpload";
import Epub, { EpubCFI } from "epubjs";
import { v4 as uuidv4 } from "uuid";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import MeiliSearch from "meilisearch";
import { initializeClient } from "@/services/meiliService";

const Mint = () => {

	const { activeEngine } = useAppSelector((state) => state.engineOverview);
	const [client, setClient] = useState<MeiliSearch | null>(null);

	const { actor } = useSession();
	const [bookLoadModal, setBookLoadModal] = useState(false);

	const [file, setFile] = useState<File | undefined>(undefined);

	const bookAreaRef = useRef(null);
	const [metadata, setMetadata] = useState<any>(null);
	const [cover, setCover] = useState<any>(null);
	const [book, setBook] = useState<any>(null);

	const [uploadStatus, setUploadStatus] = useState(0);

	const [screen, setScreen] = useState(0);

	const next = (step: any = null) => {
		if (step) {
			setScreen(step);
		} else {
			setScreen(screen + 1);
		}
	};

	const prev = () => {
		setScreen(screen - 1);
	};

	const handleCancel = () => {
		setBookLoadModal(false);
	};

	useEffect(() => {
		setMetadata(null);
		setCover(null);

		if (book) {
			book.loaded.metadata.then((metadata: any) => {
				setMetadata({
					title: metadata?.title,
					author: metadata?.author,
					fiction: metadata?.fiction,
					type: metadata?.type,
					subtypes: metadata?.subtype,
					pubyear: metadata?.pubyear,

					// Advanced Options (usually preset but the user can change)
					description: metadata?.description,
					language: metadata?.language, // defaults to en
					publisher: metadata?.publisher,
					rights: metadata?.rights,
					isbn: metadata?.isbn,
				});
			});
			book.loaded.cover.then((coverPath: string) => {
				book.archive.createUrl(coverPath).then((url: string) => {
					setCover(url);
				});
			});
		}
	}, [book]);

	const handleSubmitClick = async () => {
		next();
		let tx = undefined;
		try {
			setUploadStatus(1);
			if (!file) return;

			message.info("Creating Transaction");

			const irys = await getIrys();

			// Convert File to Buffer
			const buffer = await readFileAsBuffer(file);

			console.log("Uploading...");
			tx = irys.createTransaction(buffer, {
				tags: [
					{ name: "Content-Type", value: file.type },
					{ name: "application-id", value: "UncensoredGreats" },
					...Object.entries(metadata).map(([key, value]) => ({
						name: key,
						value:
							typeof value === "string" ? value : String(value),
					})),
				],
			});
			await tx.sign();

			message.success("Transaction Created Successfully");

			setUploadStatus(2);
		} catch (err) {
			message.error("Error Creating Transaction: " + err);
			next();
			return;
		}

		try {
			setUploadStatus(3);
			message.info("Minting NFT via ICRC7 Protocol");

			const result = await actor.mint_nft(tx.id);

			if ("Err" in result) throw new Error(result.Err);

			// if('Ok' in result) return result.Ok;

			message.success("Minted Successfully");
			setUploadStatus(4);
		} catch (err) {
			message.error("Error while Minting: " + err);
		}

		try {
			setUploadStatus(5);
			message.info("Uploading file to Arweave");

			await tx.upload();

			message.success("Uploaded Successfully");
			setUploadStatus(6);
		} catch (err) {
			message.error("Error while Minting: " + err);
		}


		let contents: any = [];

		try {
			setUploadStatus(7);
			message.info("Converting Epub to JSON");

			const epubUrl = `https://gateway.irys.xyz/${tx.id}`;

			const onlineBook = Epub(epubUrl, { openAs: "epub" });

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

					contents.push({
						id,
						cfi,
						text,
						title: metadata.title,
						author: metadata.author,
						fiction: metadata.fiction,
						type: metadata.type,
						subtype: metadata.subtype,
						pubyear: metadata.pubyear,
						asset_id: tx.id
					});
				});
			}

			message.success("Conversion Successfull");
			setUploadStatus(8);
		} catch (err) {
			message.error("Error while Minting: " + err);
		}


		try {
			if (!activeEngine) throw new Error("engine not selected");
			if (!client) throw new Error("client not initialized");

			setUploadStatus(9);
			message.info("Storing JSON docs to Engine");

			await client.index(activeEngine.index).addDocuments(contents);

			message.success("Stored Successfully");
			setUploadStatus(10);
		} catch (err) {
			message.error("Error while Minting: " + err);
		}


		setTimeout(() => {
			next(3);
		}, 2000);
	};


	useEffect(() => {
		if (!activeEngine) return;

		const init = async () => {
			setClient(null);

			const client = await initializeClient(
				activeEngine?.host,
				activeEngine?.key
			);

			setClient(client);
		};

		init();
	}, [activeEngine]);
	return (
		<>
			<button
				onClick={() => setBookLoadModal(true)}
				className="innerAuthTab border-0 text-white font-bold px-4 rounded"
			>
				Mint NFT
			</button>

			<Modal
				open={bookLoadModal}
				onCancel={handleCancel}
				footer={null}
				closable={false}
				className="min-w-[600px]"
				// classNames={{ content: '!p-0', }}
			>
				<main className="container h-full w-full flex flex-col flex-grow justify-between">
					<Header screen={screen} />

					{/* file upload modal */}

					{screen == 0 && (
						<Upload
							bookAreaRef={bookAreaRef}
							setBook={setBook}
							cover={cover}
							setFile={setFile}
							file={file}
						/>
					)}

					{screen == 1 && (
						<MetaData
							metadata={metadata}
							setMetadata={setMetadata}
						/>
					)}

					{screen == 2 && <Processing uploadStatus={uploadStatus} />}

					{screen == 3 && <Status />}

					{/* sticky footer  */}
					<Footer
						screen={screen}
						next={next}
						prev={prev}
						handleSubmitClick={handleSubmitClick}
						handleCancel={handleCancel}
						file={file}
					/>
				</main>
			</Modal>
		</>
	);
};

export default Mint;
