import React, { useState } from "react";
import Upload from "./Upload";
import MetaData from "./MetaData";
import Processing from "./Processing";
import Status from "./Status";
import Footer from "./Footer";
import Header from "./Header";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import SelectNode from "./SelectNode";
import { Dialog, DialogContent, DialogTrigger } from "@/lib/components/dialog";
import { Button } from "@/lib/components/button";
import { BookOpen, UploadIcon } from "lucide-react";


const UploadBook = () => {
	const { screen} = useAppSelector(state=>state.uploadBook)

	const [file, setFile] = useState<File | undefined>(undefined);
	const [book, setBook] = useState<any>(null);

	return (
		<Dialog>
			<DialogTrigger asChild>
				{/* <Button rounded="full">
					<UploadIcon size={20} /> <span>Upload Book</span>
				</Button> */}
				<div className="group cursor-pointer hover:shadow-lg transition-shadow duration-300 bg-gray-50 rounded-lg p-6">
					<div className="flex flex-col items-center space-y-4">
						<div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
							<BookOpen size={24} className="text-blue-600" />
						</div>
						<h3 className="font-semibold text-lg">Book</h3>
						<p className="text-sm text-gray-600 text-center">Upload EPUB books and documents</p>
					</div>
				</div>
			</DialogTrigger>

			<DialogContent closeIcon={null} className="sm:max-w-[600px]" onOpenAutoFocus={(e) => e.preventDefault()}>
				<main className="h-full w-full flex flex-col flex-grow justify-between">
					<Header screen={screen} />

					{/* file upload modal */}
					{screen == 0 && <Upload book={book} setBook={setBook} file={file} setFile={setFile}/>}

					{/* add/edit asset's metadata */}
					{screen == 1 && <MetaData/>}

					{/* select a node to use for uploading */}
					{screen == 2 && <SelectNode />}

					{/* display various uploading/processing states */}
					{screen == 3 && <Processing />}

					{/* display final success/failure */}
					{screen == 4 && <Status />}

					{/* sticky footer  */}
					<Footer file={file} book={book}/>
				</main>

			</DialogContent>
		</Dialog>
	);
};

export default UploadBook;





























