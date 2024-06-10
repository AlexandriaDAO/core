
// For now we will be the default and only node provider.
// The reason is to do a gas based uploader requires the user sign each transaction.


// Config.js
// module.exports = {
//   network: "devnet",
//   url: "https://devnet.irys.xyz",
//   providerUrl: "https://ethereum-sepolia-rpc.publicnode.com",
//   token: "ethereum",
// };






import React, { FC } from "react";

import GaslessUploader from "../features/gasless-uploader/GaslessUploader";

const Page: FC = () => {
	return (
		<div className="mx-auto py-10 bg-background text-text flex flex-col-reverse gap-10 md:flex-row justify-center items-start">
			<div className="p-10 w-full md:w-1/3 md:p-0">
				<GaslessUploader showImageView={true} showReceiptView={true} blockchain="EVM" />
			</div>

			<div className="flex flex-col text-xs space-y-1 items-start">
				<h1 className="text-2xl font-bold rounded-xl mb-3">Usage example:</h1>

				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<p className="text-base text-neutral-700">To hide the image preview:</p>
						<code className="rounded bg-[#D8CFCA] px-2 py-1">{"<GaslessUploader showImageView={ true } />"}</code>
					</div>
					<div className="flex flex-col gap-2">
						<p className="text-base text-neutral-700">To hide the receipt preview:</p>
						<code className="rounded bg-[#D8CFCA] px-2 py-1">{"<GaslessUploader showReceiptView={ true } />"}</code>
					</div>
					<div className="gap-2">
						Before testing, set the <span className="bg-gray-200 p-1">PRIVATE_KEY_EVM</span> variable in{" "}
						<span className="bg-gray-200 p-1">.env.local</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Page;



































// // This is the version using the web wallet.
// import React, { useState, useEffect } from "react";
// import MainLayout from "@/layouts/MainLayout";
// import { useAppSelector } from "@/store/hooks/useAppSelector";
// import { ethers } from "ethers";
// import { WebIrys } from "@irys/sdk";

// function BookUploadPage() {
//   const { user } = useAppSelector((state) => state.auth);
//   const [connectedAddress, setConnectedAddress] = useState("");
//   const [webIrys, setWebIrys] = useState<WebIrys | null>(null);
//   const [balance, setBalance] = useState<number | null>(null);
//   const [status, setStatus] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchNodeDetails = async () => {
//       if (webIrys) {
//         try {
//           const atomicBalance = await webIrys.getLoadedBalance();
//           console.log("Atomic Balance: ", atomicBalance);
//           //@ts-ignore
//           const convertedBalance = parseFloat(webIrys.utils.fromAtomic(atomicBalance));
//           setBalance(convertedBalance);
//         } catch (error) {
//           console.error("Error fetching node details:", error);
//         }
//       }
//     };

//     if (webIrys) {
//       fetchNodeDetails();
//     }
//   }, [webIrys]);

//   const getWebIrys = async () => {
//     let provider;
//     //@ts-ignore
//     if (window.ethereum == null) {
//       console.log("MetaMask not installed; using read-only defaults");
//       provider = ethers.getDefaultProvider();
//     } else {
//       //@ts-ignore
//       provider = new ethers.BrowserProvider(window.ethereum);
//     }
//     console.log("provider=", provider);
//     const network = "mainnet";
//     const token = "ethereum";

//     const wallet = { name: "ethersv6", provider: provider };
//     const webIrys = new WebIrys({ network, token, wallet });
//     await webIrys.ready();
//     setConnectedAddress(webIrys.address!);
//     setWebIrys(webIrys);
//   };

//   const fundNode = async () => {
//     if (webIrys) {
//       try {
//         const confirmation = window.confirm(
//           "Funding the node will deduct 0.005 ETH from your wallet. Do you want to proceed?"
//         );
//         if (confirmation) {
//           const fundTx = await webIrys.fund(webIrys.utils.toAtomic(0.005));
//           console.log(
//             `Successfully funded ${webIrys.utils.fromAtomic(fundTx.quantity)} ${
//               webIrys.token
//             }`
//           );
//         }
//       } catch (e) {
//         console.log("Error funding node ", e);
//       }
//     }
//   };

//   return (
//     <MainLayout>
//       <div className="flex-grow flex items-start p-4 gap-4">
//         <div className="basis-1/4 flex flex-col items-start gap-10">
//           {/* Add your sidebar content here */}
//         </div>

//         <div className="basis-3/4">
//           {/* Add your main content here */}
//           <h1>Irys Connection</h1>
//           {connectedAddress && connectedAddress.length > 0 && (
//             <h3>Connected from: {connectedAddress}</h3>
//           )}
//           <button onClick={getWebIrys}>Connect To Irys Node</button>
//           {webIrys && (
//             <button onClick={fundNode}>Fund Node (0.005 ETH)</button>
//           )}
//           {balance !== null && (
//             <div>
//               <h3>Node Balance: {balance} ETH</h3>
//               {balance <= 0.1 && (
//                 <p>Balance is within 10% of 0, please fund your node.</p>
//               )}
//             </div>
//           )}
//           {status && (
//             <div>
//               <h3>Node Status: {status}</h3>
//             </div>
//           )}
//         </div>
//       </div>
//     </MainLayout>
//   );
// }

// export default BookUploadPage;