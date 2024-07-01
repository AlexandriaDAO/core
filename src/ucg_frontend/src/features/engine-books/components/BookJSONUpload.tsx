import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { IoIosArrowDown, IoIosArrowUp, IoIosSearch } from "react-icons/io";
import { RxCross1 } from "react-icons/rx";
import { PiUploadSimple } from "react-icons/pi";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import MeiliSearch from "meilisearch";
import { initializeClient } from "@/services/meiliService";
import { ImSpinner8 } from "react-icons/im";
import { message } from "antd";

const BookJSONUpload = () => {
	const { activeEngine } = useAppSelector((state) => state.engineOverview);
	const [client, setClient] = useState<MeiliSearch | null>(null);

	const [fileData, setFileData] = useState<any>(null);
	const [loading, setLoading] = useState(false);

	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file && file.type === "application/json") {
			setFileData(null);
			setLoading(true);
			const reader = new FileReader();
			reader.onload = async () => {
				try {
					const json = JSON.parse(reader.result as string);
					setFileData(json);
				} catch (error) {
					console.error("Error parsing JSON:", error);
					message.error("Invalid JSON file.");
					setLoading(false);
				}
			};
			reader.readAsText(file);
		} else {
			message.error("Invalid file type. Please upload a JSON file.");
		}
	};
	const uploadFile = async () => {
		try {
			if (!activeEngine) throw new Error("engine not selected");
			if (!client) throw new Error("client not initialized");

			await client.index(activeEngine.index).addDocuments(fileData);
			message.success("Book added successfully");
		} catch (error) {
			console.error("Failed to add book:", error);
			message.error("Failed to add book");
		} finally {
			setLoading(false);
		}
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

	useEffect(() => {
		if (!fileData) return;

		uploadFile();
	}, [fileData]);

	return (
		<>
			<input
				type="file"
				accept=".json"
				onChange={handleFileChange}
				ref={fileInputRef}
				style={{ display: "none" }}
			/>
			<button
				disabled={loading}
				onClick={() => {
					fileInputRef.current?.click();
				}}
				className={`w-56 py-3 flex gap-2 justify-center items-center border border-black rounded-full font-roboto-condensed text-base leading-[18px] font-medium cursor-pointer ${
					loading
						? "bg-gray-500 text-white border-gray-700 cursor-not-allowed"
						: "hover:bg-black hover:text-white"
				} transition-all duration-100 ease-in`}
			>
				{loading ? (
					<>
                        <ImSpinner8 size={20} className="animate animate-spin" /> <span>Uploading</span>
					</>
				) : (
					<>
						<PiUploadSimple size={20} /> <span>Upload New</span>
					</>
				)}
			</button>
		</>
	);
};

export default BookJSONUpload;
