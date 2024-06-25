// Pages/ArWeave.tsx
import React, { FC } from "react";
import GaslessUploader from "../features/irys/arweave-uploader/GaslessUploader";
import BookResults from "@/features/irys/query-package/BookResults";
import KeyManager from "../features/irys/arweave-uploader/KeyManager";
import SaveLibrarian from "@/features/irys/arweave-funder/saveLibrarian";
import ArFunder from "@/features/irys/arweave-funder/funder";
import MainLayout from "@/layouts/MainLayout";
import { ActiveLibrarianProvider } from "@/contexts/LibrarianContext";
import { KeysProvider } from "@/contexts/KeysContext";

const ArWeavePage: FC = () => {
  return (
    <MainLayout>
      <div className="mx-auto py-10 bg-background text-text flex flex-col-reverse gap-10 md:flex-row justify-center items-start">
        <div className="p-10 w-full md:w-1/3 md:p-0">

          <GaslessUploader showImageView={true} showReceiptView={true} blockchain="EVM" />
          <BookResults/>
          <ActiveLibrarianProvider>
              <SaveLibrarian /> 
          </ActiveLibrarianProvider>


          <ArFunder />

          <KeyManager />
        </div>
      </div>
    </MainLayout>
  );
};

export default ArWeavePage;














































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
//           const fundTx = await webIrys.fund(webIrys.utils.toAtomic(0.0001));
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
//               {balance <= 0.00001 && (
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