import React, { useCallback, useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import useSession from "@/hooks/useSession";
import { toast } from "sonner";
import { EnqueuedTask } from "meilisearch";
import { waitForTaskCompletion } from "@/services/meiliService";
import { Book } from "@/features/portal/portalSlice";
import { getAllDocumentsByManifest } from "../utils/utilities";
import { LoaderCircle } from "lucide-react";

interface MintedBookProps {
	book: Book;
}

const MintedBook: React.FC<MintedBookProps> = ({ book }) => {
	if(!book || !book.manifest) return <></>;

	const { meiliClient } = useSession();
	const { activeEngine } = useAppSelector((state) => state.engineOverview);
	const { user } = useAppSelector((state) => state.auth);

	const [imageLoaded, setImageLoaded] = useState(false);

	const [added, setAdded] = useState(false);
	const [processing, setProcessing] = useState(true);

	const checkIfAdded = useCallback(async () => {
		if (!meiliClient || !activeEngine) return;

		const documents = await getAllDocumentsByManifest(
			meiliClient.index(activeEngine.index),
			book.manifest
		);

		if (documents.length > 0) {
			setAdded(true);
		}

		setProcessing(false);
	}, [book.manifest]);

	useEffect(() => {
		checkIfAdded();
	}, [checkIfAdded]);

	const handleRemoveBook = async () => {
		if ( !meiliClient || !activeEngine) return;

		try {
			setProcessing(true);

			const documents = await getAllDocumentsByManifest(
				meiliClient.index(activeEngine.index),
				book.manifest
			);

			if (documents.length === 0) {
				throw new Error("No documents found with for this manifest id");
			}

			const documentIds = documents.map((doc: any) => doc.id);
			const task: EnqueuedTask = await meiliClient
				.index(activeEngine.index)
				.deleteDocuments(documentIds);

			toast.info("Documents enqueued for deletion.");

			await waitForTaskCompletion(meiliClient, task.taskUid);

			toast.success("Documents deleted successfully.");

			console.log(
				`Deleted ${documentIds.length} documents with manifest id: ${book.manifest}`
			);

			setAdded(false);
		} catch (error) {
			toast.error("Failed to remove book.");

			console.error("Error deleting documents from Meilisearch:", error);
		} finally {
			setProcessing(false);
		}
	};

	if(added == false) return <></>

	return (
		<div className="flex justify-between gap-2 items-stretch text-black bg-[#F4F4F4] rounded-lg p-2">
			{!imageLoaded && (
				<img
					className="rounded-lg h-12 w-12 object-fill animate-pulse"
					src="/images/default-cover.jpg"
					alt="Loading..."
				/>
			)}
			<img
				className={`rounded-lg h-12 w-12 object-fill ${imageLoaded ? '' : 'hidden'}`}
				src={`https://gateway.irys.xyz/${book.manifest}/cover`}
				alt={book.title}
				onLoad={() => setImageLoaded(true)}
				onError={() => {
					console.error("Error loading image for "+book.manifest);
					setImageLoaded(true);
				}}
			/>
			<div className="flex-grow flex flex-col justify-between">
				<div className="flex justify-start items-center gap-1">
					<span className="font-roboto-condensed text-base leading-[18px] font-normal">
						Author :
					</span>
					<span className="font-roboto-condensed text-base leading-[18px] font-medium ">
						{book.author_first + " " + book.author_last}
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
			{user && activeEngine && user.principal === activeEngine.owner && (
				<div className="flex gap-2 align-center justify-between self-center">
					{processing ? (
						<button
							disabled
							className="cursor-not-allowed opacity-50 flex justify-center items-center gap-1 px-2 py-1 bg-black rounded text-brightyellow font-medium font-roboto-condensed text-base"
						>
							<span>Waiting...</span>
							<LoaderCircle
								size={14}
								className="animate animate-spin"
							/>
						</button>
					) : added && (
						<button
							onClick={handleRemoveBook}
							className="flex justify-center items-center gap-1 px-2 py-1 bg-black rounded cursor-pointer text-brightyellow hover:text-yellow-100 font-medium font-roboto-condensed text-base"
						>
							<span>Remove From Engine</span>
						</button>
					)}
				</div>
			)}
		</div>
	);
};

export default MintedBook;
