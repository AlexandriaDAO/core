import React, { useEffect, useRef, useState } from "react";
import { Modal, message } from "antd";
import { setDoc, uploadFile } from "@junobuild/core";
import { nanoid } from "nanoid";
import Upload from "./Upload";
import MetaData from "./MetaData";
import Processing from "./Processing";
import Status from "./Status";
import Footer from "./Footer";
import Header from "./Header";

const Mint = () => {
	const [bookLoadModal, setBookLoadModal] = useState(false);

	const [file, setFile] = useState<File | undefined>(undefined);

	const bookAreaRef = useRef(null);
	const [metadata, setMetadata] = useState<any>(null);
	const [cover, setCover] = useState<any>(null);
	const [book, setBook] = useState<any>(null);

	const[ uploadStatus, setUploadStatus] = useState(0)

	const [screen, setScreen] = useState(0);

	const next = (step:any = null) => {
		if(step){
			setScreen(step);
		}else{
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
          "title": metadata?.title,
          "author": metadata?.author,
          "description": metadata?.description,
          "fiction": metadata?.fiction,
          "types": metadata?.type,
          "subtypes": metadata?.subtype,
          "pubyear": metadata?.pubyear,
          "language": metadata?.language,

          // Advanced Options (usually preset but the user can change)
          "publisher": metadata?.publisher,
          "rights": metadata?.rights,
          "isbn": metadata?.isbn,

          // Preset (user cannot set)
          "asset": metadata?.asset,
          "ugbn": metadata?.ugbn,
          "minted": metadata?.minted,
          "modified": metadata?.modified_date,
        });
			});
			book.loaded.cover.then((coverPath: string) => {
				book.archive.createUrl(coverPath).then((url: string) => {
                    setCover(url)
				});
			});

		}
	}, [book]);


	const handleSubmitClick = async () => {
		next();

        let url = undefined;
		try {
			setUploadStatus(1);
			if (!file) return;

            message.info("Storing Book");

            // max upload size is 10mb 10000000bytes
            const { downloadUrl } = await uploadFile({
                collection: "uploads",
                data: file,
                filename: `${nanoid()}-${Date.now()}-book-${file.name}`,
            });

            message.success("Book Stored Successfully");

            url = downloadUrl;
			setUploadStatus(2);
        } catch (err) {
            message.error("Error Storing Book: " + err);
			next();
            return;
		}

        try {
			setUploadStatus(3);
            message.info("Storing MetaData");
            await setDoc({
                collection: "books",
                doc: {
                    key: nanoid(),
                    data: {
                        ...metadata,
                        ...(url !== undefined && { url }),
                    },
                },
            });

            message.success("MetaData Stored Successfully");
			setUploadStatus(4)
        } catch (err) {
            message.error("Error Storing MetaData: " + err);
        }

		setTimeout(()=>{
			next(3);
		}, 2000)

	};

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

					{screen == 0 && <Upload bookAreaRef={bookAreaRef} setBook={setBook} cover={cover} setFile={setFile} file={file} />}

					{screen == 1 && <MetaData metadata={metadata} setMetadata={setMetadata}/>}

					{screen == 2 && <Processing uploadStatus={uploadStatus}/>}

					{screen == 3 && <Status />}

					{/* sticky footer  */}
					<Footer screen={screen} next={next} prev={prev} handleSubmitClick={handleSubmitClick} handleCancel={handleCancel} file={file} />
				</main>
			</Modal>
		</>
	);
};

export default Mint;
