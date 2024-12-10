import { Button } from "@/lib/components/button";
import { DialogClose } from "@/lib/components/dialog";
import { toast } from "sonner";
import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { next, previous, setStatus } from "./uploadBookSlice";
import { useAlexWallet } from "@/hooks/actors";
import { getServerIrys } from "@/services/irysService";
import { readFileAsBuffer } from "../irys/utils/gaslessFundAndUpload";
import { WebIrys } from "@irys/sdk";

const APP_ID = process.env.DFX_NETWORK === "ic" ? process.env.REACT_MAINNET_APP_ID : process.env.REACT_LOCAL_APP_ID;

const Footer = ({ file, book }: any) => {
	const {actor} = useAlexWallet();
	const dispatch = useAppDispatch();
	const {screen, cover, metadata, isMetaDataValid, selectedNode} = useAppSelector(state=>state.uploadBook);

	const validateSubmission = (): boolean => {
		if (!APP_ID){
			toast.error("Application ID is not set.");
			return false;
		}

		if (!file) {
			toast.error("Please upload a file");
			return false;
		}

		if (!book) {
			toast.error("Uploaded file is not a valid book");
			return false;
		}

		if (!isMetaDataValid) {
			toast.error("Please fill out all required metadata fields correctly");
			return false;
		}

		return true;
	};

	const handleSubmitClick = async () => {
		try {
			if(!validateSubmission()) return;

			if(!selectedNode) {
				toast.error("Please select a node");
				return;
			}

			dispatch(next());

			if (!actor) {
				throw new Error("No actor available");
			}

			dispatch(setStatus(1));
			const irys = await getServerIrys(selectedNode, actor);
			const transactions = await createAllTransactions(irys);

			await uploadToArweave(irys, transactions);
			console.log('transactions', transactions);

			setTimeout(() => dispatch(next()), 2000);
		} catch (error) {
			toast.error(`Error: ${error}`);
			next();
		}
	};


	const createAllTransactions = async (irys: WebIrys) => {
		toast.info("Creating Transactions");

		const bookTx = await createBookTransaction(irys);
		const coverTx = await createCoverTransaction(irys);
		const dataTx = await createMetadataTransaction(irys);
		const manifestTx = await createManifestTransaction(irys, { bookTx, coverTx, dataTx });

		toast.success("Transactions Created Successfully");
		dispatch(setStatus(2));

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
		const map = new Map([
			["book", txs.bookTx.id],
			["cover", txs.coverTx.id],
			["metadata", txs.dataTx.id]
		]);

		const manifest = await irys.uploader.generateManifest({ items: map , indexFile: 'metadata'});

		const tags = [
			{ name: "Content-Type", value: "application/x.arweave-manifest+json" },
			{ name: "application-id", value: APP_ID! }
		]

		const tx = irys.createTransaction(JSON.stringify(manifest, null, 2), { tags });

		await tx.sign();
		return tx;
	};

	const uploadToArweave = async (irys: WebIrys, transactions: any) => {
		dispatch(setStatus(3));
		toast.info("Uploading files to Arweave");

		try {
			await uploadTransaction(transactions.book, "Book");
			await uploadTransaction(transactions.cover, "Cover");
			await uploadTransaction(transactions.data, "Metadata");
			await uploadTransaction(transactions.manifest, "Manifest");

			toast.success("All files uploaded successfully");
			console.log('manifest id', transactions.manifest.id);
			dispatch(setStatus(4));
		} catch (error) {
			toast.error("Upload failed");
			console.error('Error while uploading assets to Arweave:', error);
			dispatch(setStatus(0)); // Reset status or set to an error state
		}
	};

	const uploadTransaction = async (transaction: any, name: string) => {
		try {
			await transaction.upload();
			toast.success(`${name} uploaded successfully`);
		} catch (error) {
			throw new Error(`Failed to upload ${name}: ${error}`);
		}
	};

	return (
		<footer className="flex justify-between items-center p-4 gap-2">
			{screen == 0 && (
				<Button onClick={() => dispatch(next())} type="button" disabled={!file} variant={!file ? "inverted" : "info"}>
					Next
				</Button>
			)}
			{screen == 1 && (
				<div className="flex justify-start gap-2 items-center">
					<Button
						type="button"
						disabled={!isMetaDataValid}
						variant={!isMetaDataValid ? "inverted" : "info"}
						onClick={() => validateSubmission() && dispatch(next())}>
						Next
					</Button>
					<Button
						type="button"
						variant="secondary"
						onClick={() => dispatch(previous())}
					>
						Previous
					</Button>
				</div>
			)}

			{screen == 2 && (
				<div className="flex justify-start gap-2 items-center">
					<Button
						type="button"
						disabled={!selectedNode}
						variant={!selectedNode ? "inverted" : "info"}
						onClick={handleSubmitClick}
					>
						Submit
					</Button>
					<Button
						type="button"
						variant="secondary"
						onClick={() => dispatch(previous())}
					>
						Previous
					</Button>
				</div>
			)}

			{screen == 4 && (
				<Button
					type="button"
					variant="constructive"
					onClick={() => window.location.reload()}
				>
					Refresh
				</Button>
			)}


			<DialogClose asChild>
				<Button type="button" variant="outline">Close</Button>
			</DialogClose>
		</footer>
	);
};

export default Footer;
