import { FileWrapper, Metadata, Tag } from "./types";
import gaslessFundAndUpload from "../utils/gaslessFundAndUpload";
import getReceipt from "../utils/getReceipt";

export const GATEWAY_BASE = "https://gateway.irys.xyz/";

export const handleFileUpload = (
  event: React.ChangeEvent<HTMLInputElement>,
  setFiles: (files: FileWrapper[]) => void
) => {
  if (event.target.files) {
    const files = Array.from(event.target.files);
    const newUploadedFiles: FileWrapper[] = files.map((file) => ({
      file,
      isUploaded: false,
      id: "",
      previewUrl: "",
      loadingReceipt: false,
    }));
    setFiles(newUploadedFiles);
  }
};

export const handleUpload = async (
  files: FileWrapper[],
  setFiles: (files: FileWrapper[]) => void,
  setTxProcessing: (processing: boolean) => void,
  blockchain: string,
  // tags: { [key: string]: string }
  tags: Metadata
) => {
  if (!files || files.length === 0) {
    return;
  }
  setTxProcessing(true);
  try {
    for (const file of files) {
      const tagArray: Tag[] = [
        { name: "Content-Type", value: file.file.type },
        { name: "application-id", value: "UncensoredGreats" },
        ...Object.entries(tags).map(([key, value]) => ({
          name: key,
          value: typeof value === "string" ? value : String(value),
        })),
      ];


      //@ts-ignore
      const uploadTxId = await gaslessFundAndUpload(file.file, tagArray, blockchain);

      file.id = uploadTxId;
      file.isUploaded = true;
      file.previewUrl = GATEWAY_BASE + uploadTxId;
      console.log("set previewURL=", file.previewUrl);
    }
    setFiles([...files]);
  } catch (e) {
    console.log("Error on upload: ", e);
  }
  setTxProcessing(false);
};

export const showReceipt = async (
  files: FileWrapper[],
  fileIndex: number,
  setFiles: (files: FileWrapper[]) => void,
  setReceipt: (receipt: string) => void,
  setPreviewURL: (url: string) => void
) => {
  let updatedFiles = [...files];
  updatedFiles[fileIndex].loadingReceipt = true;
  setFiles(updatedFiles);
  try {
    const receipt = await getReceipt(files[fileIndex].id);
    setReceipt(JSON.stringify(receipt));
    setPreviewURL("");
  } catch (e) {
    console.log("Error fetching receipt: " + e);
  }
  updatedFiles = [...files];
  updatedFiles[fileIndex].loadingReceipt = false;
  setFiles(updatedFiles);
};

