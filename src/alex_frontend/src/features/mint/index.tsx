import React, { useEffect, useRef, useState } from "react";
import { Modal, message } from "antd";
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
import { useAuth } from "../../contexts/AuthContext";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import fetchEngineBooks from "../engine-books/thunks/fetchEngineBooks";
import { PiUploadSimple } from "react-icons/pi";

const Mint = () => {
	const { icrc7Actor } = useAuth();

	const { activeEngine } = useAppSelector((state) => state.engineOverview);

	const dispatch = useAppDispatch();

	const { actor, meiliClient } = useSession();
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
    if (!file) {
      message.error("Please upload a file");
      return false;
    }

    if (!metadataRef.current || !metadataRef.current.validateFields()) {
      message.error("Please fill out all required metadata fields correctly");
      return false;
    }

    // Add any other necessary checks here

    return true;
  };

	const handleSubmitClick = async () => {
		if (!validateSubmission()) {
			return;
		}

		next();
		let tx = undefined;
		try {
			setUploadStatus(1);
			if (!file) return;

			message.info("Creating Transaction");

			const totalSupply = await icrc7Actor.icrc7_total_supply();
			const mintingNumber = Number(totalSupply) + 1;

			const irys = await getIrys();

			const APP_ID = process.env.DFX_NETWORK === "ic" 
    ? process.env.REACT_MAINNET_APP_ID 
    : process.env.REACT_LOCAL_APP_ID;

			if (!APP_ID) {
					throw new Error("Application ID is not set in environment variables");
			}

			// Convert File to Buffer
			const buffer = await readFileAsBuffer(file);

			console.log("Uploading...");
			tx = irys.createTransaction(buffer, {
				tags: [
					{ name: "Content-Type", value: file.type },
					{ name: "application-id", value: APP_ID },
					{ name: "minting_number", value: mintingNumber.toString() },
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

			dispatch(fetchEngineBooks({
				actor, engine: activeEngine
			}));
		} catch (err) {
			message.error("Error while Minting: " + err);
		}


		setTimeout(() => {
			next(3);
		}, 2000);
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





























