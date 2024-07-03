import getIrys from "./getIrys";



// Helper function to read File as Buffer
export const readFileAsBuffer = (file: File): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        const buffer = Buffer.from(reader.result);
        resolve(buffer);
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'));
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
};

type Tag = {
  name: string;
  value: string;
};

const gaslessFundAndUploadEVM = async (selectedFile: File, tags: Tag[]): Promise<string> => {
  const irys = await getIrys();

  // Convert File to Buffer
  const buffer = await readFileAsBuffer(selectedFile);

  console.log("Uploading...");
  const tx =  irys.createTransaction(buffer, {
    tags,
  });
  await tx.sign();

  const receipt = await tx.upload();

  console.log(`Uploaded successfully. https://gateway.irys.xyz/${receipt.id}`);

  return receipt.id;
};

const gaslessFundAndUpload = async (selectedFile: File, tags: Tag[], blockchain: "EVM" | "SOL"): Promise<string> => {
  let txId = "";
  switch (blockchain) {
    case "EVM":
      txId = await gaslessFundAndUploadEVM(selectedFile, tags);
      break;
    default:
      throw new Error("Unsupported blockchain");
  }
  return txId;
};

export default gaslessFundAndUpload;







// // Version designed for folders, not files, for when we add separate image files.
// // Uncomment this and UploadLogic.tsx and it will upload as folders instead of files.


// import getIrys from "./getIrys";

// type Tag = {
//   name: string;
//   value: string;
// };

// // Define the TaggedFile type
// interface TaggedFile extends File {
//   tags?: Tag[];
// }

// interface UploadOptions {
//   indexFileRelPath?: string;
//   manifestTags?: Tag[];
//   throwawayKey?: any;
//   separateManifestTx?: boolean;
// }

// const gaslessFundAndUploadFolderEVM = async (
//   files: File[],
//   tags: Tag[],
//   options: UploadOptions = {}
// ): Promise<string> => {
//   const irys = await getIrys();

//   console.log("Uploading files...");
//   // Create TaggedFile objects
//   const taggedFiles: TaggedFile[] = files.map(file => {
//     const taggedFile = file as TaggedFile;
//     taggedFile.tags = tags;
//     return taggedFile;
//   });

//   const response = await irys.uploadFolder(taggedFiles, options);
//   console.log(`Files uploaded successfully. Manifest ID: ${response.manifestId}`);
//   console.log(`Access your files at: https://gateway.irys.xyz/${response.manifestId}`);

//   return response.manifestId;
// };

// const gaslessFundAndUploadFolder = async (
//   files: File[],
//   tags: Tag[],
//   options: UploadOptions = {},
//   blockchain: "EVM" | "SOL"
// ): Promise<string> => {
//   let manifestId = "";
//   switch (blockchain) {
//     case "EVM":
//       manifestId = await gaslessFundAndUploadFolderEVM(files, tags, options);
//       break;
//     default:
//       throw new Error("Unsupported blockchain");
//   }
//   return manifestId;
// };

// export default gaslessFundAndUploadFolder;
