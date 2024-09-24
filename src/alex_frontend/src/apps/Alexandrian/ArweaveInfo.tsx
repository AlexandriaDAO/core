import React, { useEffect, useState } from "react";

interface Tag {
	name: string;
	value: string;
}

interface TransactionData {
	tags: Tag[];
	data_size: string;
	data_type: string;
}

function ArweaveInfo() {
	const [transactionDataList, setTransactionDataList] = useState<TransactionData[]>([]);
	const [metadataList, setMetadataList] = useState<any[]>([]);
	const [fileTypeList, setFileTypeList] = useState<string[]>([]);
	const [fileDataList, setFileDataList] = useState<string[]>([]);
	const [errorList, setErrorList] = useState<string[]>([]);

  const tx_ids = [
    // "RSbHp9leGZ_fGpbkUYnrmUP-Db0D0FeVzMj-qgOo-Io", // The illiad tx
    "1LHMKQudpoTmz8FivcOZbBPgsqfH3o_g1q5rFEGTZD8", // The illiad epub file.
    // "J2-SvXQYfHdNyaf4ISnp4y96_qcAPORp5vFcF18MwQA", // random file.
    // "BpRDpMRGHWqouZVv27yCsEcR-l7d_1z7A6eZ-tup8Ik", // random file
    // "CUmAwoh2328K1LzmyLaHQvQUgnUoi4XJlm490t6ANG4", // random file
    // "2i7eA-M7V1JZuEi2z_jNpe7gEyZqB_MBGXzhSZzkUhM", // News article
    // "KwQKCzVJ0Rr3tP8_XdFLRxxs9_zV-lHnM68DREELsGg", // Reddit post
    // "C2_kuar5m3U92oTRry21vfwCi_goMs_kYBSh4Ol-GnU", // Space article
  ];

  const arweaveUrls = tx_ids.map(tx_id => `https://arweave.net/${tx_id}`);

	useEffect(() => {
		const fetchTransactionData = async (url: string) => {
			try {
				const response = await fetch(url);
				const data: TransactionData = await response.json();
				setTransactionDataList(prev => [...prev, data]);

				const tags = data.tags || [];
				const metadataTag = tags.find((tag: Tag) => tag.name === "metadata");
				if (metadataTag) {
					try {
						const metadata = JSON.parse(metadataTag.value);
						setMetadataList(prev => [...prev, metadata]);

						const fileType = metadata.fileType || "unknown";
						setFileTypeList(prev => [...prev, fileType]);
					} catch (parseError) {
						console.error("Failed to parse metadata:", parseError);
						setErrorList(prev => [...prev, "Failed to parse metadata"]);
					}
				} else {
					// Use data_type if metadata is not available
					const fileType = data.data_type || "unknown";
					setFileTypeList(prev => [...prev, fileType]);
					setErrorList(prev => [...prev, "Metadata tag not found"]);
				}

				// Fetch the actual file data if available
				if (data.data_size && data.data_type) {
					const fileResponse = await fetch(url);
					const fileData = await fileResponse.text();
					setFileDataList(prev => [...prev, fileData]);
				}
			} catch (error: unknown) {
				if (error instanceof Error) {
					setErrorList(prev => [...prev, error.message]);
				} else {
					setErrorList(prev => [...prev, String(error)]);
				}
			}
		};

		arweaveUrls.forEach(url => {
			fetchTransactionData(url);
		});
	}, []);

	return (
    <div className="w-full h-full p-4">
      {errorList.map((error, index) => (
        <div key={index} className="text-red-500">Error: {error}</div>
      ))}
      {transactionDataList.map((transactionData, index) => (
        <div key={index}>
          <h2>Transaction Data {index + 1}</h2>
          <pre>{JSON.stringify(transactionData, null, 2)}</pre>
        </div>
      ))}
      {metadataList.map((metadata, index) => (
        <div key={index}>
          <h2>Metadata {index + 1}</h2>
          <pre>{JSON.stringify(metadata, null, 2)}</pre>
        </div>
      ))}
      {fileTypeList.map((fileType, index) => (
        <div key={index}>
          <h2>File Type {index + 1}</h2>
          <p>{fileType}</p>
        </div>
      ))}
      {fileDataList.map((fileData, index) => (
        <div key={index}>
          <h2>File Data {index + 1}</h2>
          <pre>{fileData}</pre>
        </div>
      ))}
    </div>
	);
}

export default ArweaveInfo;