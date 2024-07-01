import React, { useEffect, useRef, useState } from "react";
import { Modal, message } from "antd";
import { setDoc, uploadFile } from "@junobuild/core";
import { nanoid } from "nanoid";
import Header from "./components/Header";
import Upload from "./screens/Upload";
import MetaData from "./screens/MetaData";
import Processing from "./screens/Processing";
import Status from "./screens/Status";
import Footer from "./components/Footer";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { MintScreen, setShowModal } from "./mintSlice";

const Mint = () => {
	const dispatch = useAppDispatch();
	const {showModal, screen } = useAppSelector(state=>state.mint)

	// const handleSubmitClick = async () => {
	// 	next();

    //     let url = undefined;
	// 	try {
	// 		setUploadStatus(1);
	// 		if (!file) return;

    //         message.info("Storing Book");

    //         // max upload size is 10mb 10000000bytes
    //         const { downloadUrl } = await uploadFile({
    //             collection: "uploads",
    //             data: file,
    //             filename: `${nanoid()}-${Date.now()}-book-${file.name}`,
    //         });

    //         message.success("Book Stored Successfully");

    //         url = downloadUrl;
	// 		setUploadStatus(2);
    //     } catch (err) {
    //         message.error("Error Storing Book: " + err);
	// 		next();
    //         return;
	// 	}

    //     try {
	// 		setUploadStatus(3);
    //         message.info("Storing MetaData");
    //         await setDoc({
    //             collection: "books",
    //             doc: {
    //                 key: nanoid(),
    //                 data: {
    //                     ...metadata,
    //                     ...(url !== undefined && { url }),
    //                 },
    //             },
    //         });

    //         message.success("MetaData Stored Successfully");
	// 		setUploadStatus(4)
    //     } catch (err) {
    //         message.error("Error Storing MetaData: " + err);
    //     }

	// 	setTimeout(()=>{
	// 		next(3);
	// 	}, 2000)

	// };




	return (
		<>
			<button
				onClick={() => dispatch(setShowModal(true))}
				className="innerAuthTab border-0 text-white font-bold px-4 rounded"
			>
				Mint NFT
			</button>

			<Modal
				open={showModal}
				onCancel={()=>dispatch(setShowModal(false))}
				footer={null}
				closable={false}
				className="min-w-[600px]"
				classNames={{ content: '!p-0', }}
			>
				<main className="container h-full w-full flex flex-col flex-grow justify-between">
					<Header />

					{/* file upload modal */}

					{screen == MintScreen.Upload && <Upload />}

					{screen == MintScreen.MetaData && <MetaData />}

					{/* {screen == 2 && <Processing uploadStatus={uploadStatus}/>}

					{screen == 3 && <Status />} */}

					{/* sticky footer  */}
					{/* <Footer screen={screen} next={next} prev={prev} handleSubmitClick={handleSubmitClick} handleCancel={handleCancel} file={file} /> */}
				</main>
			</Modal>
		</>
	);
};

export default Mint;
