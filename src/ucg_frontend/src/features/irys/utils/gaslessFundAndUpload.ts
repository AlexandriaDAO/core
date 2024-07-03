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

