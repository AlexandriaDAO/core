import React, { useEffect, useRef, useState } from "react";
import { Modal, message } from "antd";
import Upload from "./Upload";
import MetaData from "./MetaData";
import Processing from "./Processing";
import Status from "./Status";
import Footer from "./Footer";
import Header from "./Header";
import { arweaveIdToNat } from "@/utils/id_convert";
import useSession from "@/hooks/useSession";
import { getServerIrys } from "@/services/irysService";
import { readFileAsBuffer } from "../irys/utils/gaslessFundAndUpload";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import fetchEngineBooks from "../engine-books/thunks/fetchEngineBooks";
import { PiUploadSimple } from "react-icons/pi";
import { WebIrys } from "@irys/sdk";
import SelectNode from "./SelectNode";
import { Node } from "../../../../../src/declarations/alex_librarian/alex_librarian.did";


const APP_ID = process.env.DFX_NETWORK === "ic" ? process.env.REACT_MAINNET_APP_ID : process.env.REACT_LOCAL_APP_ID;

const Mint = () => {
	const { activeEngine } = useAppSelector((state) => state.engineOverview);

	const dispatch = useAppDispatch();

	const { actorAlexWallet, actorAlexLibrarian, actorIcrc7, actorNftManager, actor, meiliClient } = useSession();
	const [bookLoadModal, setBookLoadModal] = useState(false);

	const [file, setFile] = useState<File | undefined>(undefined);

	const bookAreaRef = useRef(null);
	const [metadata, setMetadata] = useState<any>(null);
	const [cover, setCover] = useState<any>(null);
	const [book, setBook] = useState<any>(null);

	const [uploadStatus, setUploadStatus] = useState(0);

	const [screen, setScreen] = useState(0);

	const [selectedNode, setSelectedNode] = useState<Node | null>(null);

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
					fiction: metadata?.fiction,
					language: metadata?.language,
				});
			});
			book.loaded.cover.then((coverPath: string) => {
				book.archive.createUrl(coverPath).then((url: string) => {
					setCover(url);
				});
			});
		}
	}, [book]);

	const metadataRef = useRef<{ validateFields: () => boolean } | null>(null);

	const validateSubmission = (): boolean => {
		if (!APP_ID){
			message.error("Application ID is not set.");
			return false;
		}

		if (!file) {
			message.error("Please upload a file");
			return false;
		}

		if (!metadataRef.current || !metadataRef.current.validateFields()) {
			message.error("Please fill out all required metadata fields correctly");
			return false;
		}

		return true;
	};

	const handleSubmitClick = async () => {
		if (!selectedNode) {
			message.error("Please select a node");
			return;
		}

		next();

		try {
			if(!selectedNode) {
				message.error("Please select a node");
				return;
			}
			const irys = await getServerIrys(actorAlexWallet, selectedNode.id);
			const transactions = await createAllTransactions(irys);

			await mintNFT(transactions.manifest.id);
			await uploadToArweave(irys, transactions);

			if(activeEngine) dispatch(fetchEngineBooks({ actorNftManager, engine: activeEngine }));

			setTimeout(() => next(3), 2000);
		} catch (error) {
			message.error(`Error: ${error}`);
			next();
		}
	};

	const createAllTransactions = async (irys: WebIrys) => {
		setUploadStatus(1);
		message.info("Creating Transactions");

		const bookTx = await createBookTransaction(irys);
		const coverTx = await createCoverTransaction(irys);
		const dataTx = await createMetadataTransaction(irys);
		const manifestTx = await createManifestTransaction(irys, { bookTx, coverTx, dataTx });

		message.success("Transactions Created Successfully");
		setUploadStatus(2);

		return { book: bookTx, cover: coverTx, data: dataTx, manifest: manifestTx };
	};

	const createBookTransaction = async (irys: WebIrys) => {
		const buffer = await readFileAsBuffer(file!);
		const tx = irys.createTransaction(buffer, {
		  	tags: [{ name: "Content-Type", value: file!.type }]
		});
		await tx.sign();
		return tx;
	};

	const createCoverTransaction = async (irys: WebIrys) => {
		const response = await fetch(cover ?? '/images/default-cover.jpg');
		const coverBuffer = Buffer.from(await response.arrayBuffer());
		const coverType = response.headers.get('Content-Type') || 'image/jpeg';

		const tx = irys.createTransaction(coverBuffer, {
			tags: [{ name: "Content-Type", value: coverType }]
		});
		await tx.sign();
		return tx;
	};
	const createMetadataTransaction = async (irys: WebIrys) => {
		const metadataJson = JSON.stringify(metadata, null, 2);
		const tx = irys.createTransaction(metadataJson, {
		  tags: [{ name: "Content-Type", value: "application/json" }]
		});
		await tx.sign();
		return tx;
	};
	const createManifestTransaction = async (irys: WebIrys, txs: { bookTx: any, coverTx: any, dataTx: any }) => {
		const totalSupply = await actorIcrc7.icrc7_total_supply();
		const mintingNumber = Number(totalSupply) + 1;

		const map = new Map([
			["book", txs.bookTx.id],
			["cover", txs.coverTx.id],
			["metadata", txs.dataTx.id]
		]);

		const manifest = await irys.uploader.generateManifest({ items: map , indexFile: 'metadata'});

		const tx = irys.createTransaction(JSON.stringify(manifest, null, 2), {
			tags: [
				{ name: "Content-Type", value: "application/x.arweave-manifest+json" },
				{ name: "application-id", value: APP_ID! },
				{ name: "minting_number", value: mintingNumber.toString() },
			]
		});
		await tx.sign();
		return tx;
	};
	const mintNFT = async (transactionId: string) => {
		setUploadStatus(3);
		message.info("Minting NFT via ICRC7 Protocol");

		const mintNumber = BigInt(arweaveIdToNat(transactionId));
		const description = "test";
		const result = await actorNftManager.mint_nft(mintNumber, [description]);
		if ("Err" in result) throw new Error(result.Err);

		message.success("Minted Successfully");
		setUploadStatus(4);
	};


	const uploadToArweave = async (irys: WebIrys, transactions: any) => {
		setUploadStatus(5);
		message.info("Uploading files to Arweave");

		Promise.all([
			transactions.book.upload(),
			transactions.cover.upload(),
			transactions.data.upload(),
			transactions.manifest.upload(),
		]).then(()=>{
			message.success("Uploaded Successfully");
			console.log(transactions.manifest.id);
			setUploadStatus(6);
		}).catch(err=>{
			message.error("Uploaded Error");
			console.error('Error while uploading assets to arweave');
		})

	};


	return (
		<>
			<button
				onClick={() => setBookLoadModal(true)}
				className="w-56 py-3 flex gap-2 justify-center items-center border border-black rounded-full font-roboto-condensed text-base leading-[18px] font-medium cursor-pointer hover:bg-black hover:text-white transition-all duration-100 ease-in"
			>
				<PiUploadSimple size={20} /> <span>Upload New</span>
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
						ref={metadataRef}
						setMetadata={setMetadata}
						metadata={metadata}
						/>
					)}

					{screen == 2 && (
						<SelectNode
						setSelectedNode={setSelectedNode}
						selectedNode={selectedNode}
						/>
					)}


					{screen == 3 && <Processing uploadStatus={uploadStatus} />}

					{screen == 4 && <Status />}

					{/* sticky footer  */}
					<Footer
						screen={screen}
						next={next}
						prev={prev}
						handleSubmitClick={handleSubmitClick}
						handleCancel={handleCancel}
						validateSubmission={validateSubmission}
						file={file}
					/>
				</main>
			</Modal>
		</>
	);
};

export default Mint;





























