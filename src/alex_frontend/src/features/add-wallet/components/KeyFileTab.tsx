import React, { useState } from "react";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Upload } from "lucide-react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import importKeyFile from "../thunks/importKeyFile";

export function KeyFileTab() {
	const dispatch = useAppDispatch();
	const { importing } = useAppSelector(state => state.addWallet);
	const [keyFile, setKeyFile] = useState<File | null>(null);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			setKeyFile(file);

			try {
				const fileContent = await file.text();
				await dispatch(importKeyFile(fileContent)).unwrap();
			} catch (error) {
				console.error("Error importing wallet:", error);
			}
		}
	};

	return (
		<div className="space-y-6 py-4">
			<div className="space-y-4">
				<Label
					htmlFor="keyfile"
					className="text-base font-medium text-gray-900 dark:text-gray-100"
				>
					Select your Arweave key file
				</Label>
				<div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-800/50 transition-colors">
					<Input
						id="keyfile"
						type="file"
						accept=".json"
						onChange={handleFileChange}
						disabled={importing}
						className="hidden"
					/>
					<label htmlFor="keyfile" className="cursor-pointer">
						<Upload className="h-6 w-6 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
						<p className="text-sm font-medium text-gray-700 dark:text-gray-300">
							{keyFile
								? keyFile.name
								: "Drop your key file here or click to browse"}
						</p>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
							Supports JSON key file format
						</p>
					</label>
				</div>
			</div>
		</div>
	);
}
