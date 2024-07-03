// import getIrys from "./getIrys";

// type Tag = {
//   name: string;
//   value: string;
// };

// const gaslessFundAndUploadEVM = async (selectedFile: File, tags: Tag[]): Promise<string> => {
//   const irys = await getIrys();

//   console.log("Uploading...");
//   const tx = await irys.uploadFile(selectedFile, {
//     tags,
//   });
//   console.log(`Uploaded successfully. https://gateway.irys.xyz/${tx.id}`);

//   return tx.id;
// };

// const gaslessFundAndUpload = async (selectedFile: File, tags: Tag[], blockchain: "EVM" | "SOL"): Promise<string> => {
//   let txId = "";
//   switch (blockchain) {
//     case "EVM":
//       txId = await gaslessFundAndUploadEVM(selectedFile, tags);
//       break;
//     default:
//       throw new Error("Unsupported blockchain");
//   }
//   return txId;
// };

// export default gaslessFundAndUpload;



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

// Zeeshans approach
  // Convert File to Buffer
  const buffer = await readFileAsBuffer(selectedFile);

  console.log("Uploading...");
  const tx =  irys.createTransaction(buffer, {

    // // Evan's approach before merge
//   console.log("Creating transaction...");
  
//   // Generate a deterministic anchor
//   const anchor = randomBytes(16).toString("hex");

//   //@ts-ignore
//   const tx = irys.createTransaction(selectedFile, {
    tags,
    // anchor,
  });

  await tx.sign();

  const receipt = await tx.upload();

  console.log(`Uploaded successfully. https://gateway.irys.xyz/${receipt.id}`);

  return receipt.id;
 // // Evan's stupid approach before merge
//   // Sign the transaction to get the ID
//   await tx.sign();
//   const txId = tx.id;

//   console.log(`Transaction created with ID: ${txId}`);
//   console.log("Uploading...");

//   // Perform the actual upload
//   await tx.upload();

//   console.log(`Uploaded successfully. https://gateway.irys.xyz/${txId}`);

//   return txId;
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

