import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AiOutlineFileSearch } from "react-icons/ai";
import Button from "../components/Button";
import { PiReceiptLight } from "react-icons/pi";
import ReceiptJSONView from "../components/ReceiptJSONView";
import Spinner from "../components/Spinner";
import { FileWrapper, UploaderConfigProps, Metadata } from "./types";
import Tags from "./Tags";
import {
  GATEWAY_BASE,
  handleFileUpload,
  handleUpload,
  showReceipt,
} from "./UploadLogic";

export const GaslessUploader: React.FC<UploaderConfigProps> = ({
  showImageView = true,
  showReceiptView = true,
  blockchain = "EVM",
}) => {
  const [files, setFiles] = useState<FileWrapper[]>([]);
  const [previewURL, setPreviewURL] = useState<string>("");
  const [receipt, setReceipt] = useState<string>("");
  const [txProcessing, setTxProcessing] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [tags, setTags] = useState<Metadata>({
    title: "",
    author: "",
    fiction: true,
    categories: [],
    mainCategory: null,
    pubyear: 0,
    language: "en",
  });

  useEffect(() => {
    setMessage("");
  }, []);

  const resetFilesAndOpenFileDialog = useCallback(() => {
    setFiles([]);
    setReceipt("");
    setPreviewURL("");
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }, []);

  const memoizedPreviewURL = useMemo(() => {
    if (previewURL) {
      return (
        <div>
          <img
            className="w-full h-full rounded-xl resize-none bg-primary object-cover"
            src={previewURL}
            alt="Thumbnail"
          />
        </div>
      );
    }
    return null;
  }, [previewURL]);

  const memoizedReceiptView = useMemo(() => {
    console.log("memoizedReceiptView called");
    if (receipt && !previewURL) {
      return (
        <div className="w-full">
          <ReceiptJSONView data={receipt} />
        </div>
      );
    }
    return null;
  }, [receipt, previewURL]);

  const handleTagsChange = (metadata: Metadata) => {
    setTags(metadata);
  };

  return (
    <div className={`bg-white rounded-lg border shadow-2xl mx-auto min-w-full`}>
      <div className="flex p-5">
        <div className={`space-y-6 ${memoizedPreviewURL && memoizedReceiptView ? "w-1/2" : "w-full"}`}>
          <div
            className="border-2 border-dashed bg-[#EEF0F6]/60 border-[#EEF0F6] rounded-lg p-4 text-center"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const droppedFiles = Array.from(event.dataTransfer.files);
              const newUploadedFiles: FileWrapper[] = droppedFiles.map((file) => ({
                file,
                isUploaded: false,
                id: "",
                previewUrl: "",
                loadingReceipt: false,
              }));
              setFiles(newUploadedFiles);
            }}
          >
            <p className="text-gray-400 mb-2">Drag and drop files here</p>
            <input
              type="file"
              multiple
              onChange={(event) => handleFileUpload(event, setFiles)}
              className="hidden"
            />
            <button
              onClick={resetFilesAndOpenFileDialog}
              className={`w-full min-w-full py-2 px-4 bg-[#DBDEE9] text-text font-bold rounded-md flex items-center justify-center transition-colors duration-500 ease-in-out  ${
                txProcessing ? "bg-[#DBDEE9] cursor-not-allowed" : "hover:bg-[#DBDEE9] hover:font-bold"
              }`}
              disabled={txProcessing}
            >
              {txProcessing ? <Spinner color="text-background" /> : "Browse Files"}
            </button>
          </div>
          {files.length > 0 && (
            <div className="flex flex-col space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-start mb-2">
                  <span className="mr-2 text-text">{file.file.name}</span>
                  {file.isUploaded && (
                    <>
                      <span className="ml-auto">
                        {showImageView && (
                          <button
                            className="p-2 h-10 font-xs bg-black rounded-full text-white w-10 flex items-center justify-center transition-colors duration-500 ease-in-out hover:text-white"
                            onClick={() => setPreviewURL(file.previewUrl)}
                          >
                            <AiOutlineFileSearch className="white-2xl" />
                          </button>
                        )}
                      </span>

                      <span className="ml-2">
                        {showReceiptView && (
                          <button
                            className="p-2  h-10 font-xs bg-black rounded-full text-white w-10 flex items-center justify-center transition-colors duration-500 ease-in-out hover:text-white"
                            onClick={() =>
                              showReceipt(files, index, setFiles, setReceipt, setPreviewURL)
                            }
                          >
                            {file.loadingReceipt ? (
                              <Spinner color="text-background" />
                            ) : (
                              <PiReceiptLight className="text-2xl" />
                            )}
                          </button>
                        )}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          {memoizedReceiptView && (
            <div className="h-56 flex justify-center space-y-4 bg-[#EEF0F6]/60 rounded-xl overflow-auto">
              {memoizedReceiptView}
            </div>
          )}
          {memoizedPreviewURL && (
            <div className="h-96 flex justify-center space-y-4 bg-[#EEF0F6]/60 rounded-xl overflow-auto">
              {memoizedPreviewURL}
            </div>
          )}
					<Tags onTagsChange={handleTagsChange} />
					<Button
						onClick={() => handleUpload(files, setFiles, setTxProcessing, blockchain, tags)}
						disabled={txProcessing}
						checkConnect={false}
					>
            {txProcessing ? <Spinner color="text-background" /> : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GaslessUploader;