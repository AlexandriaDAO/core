// Here's what we're going to do. This setup will allow eth wallets to create nodes that others can use and pay ICP for. That's it. To call functions on them, they'll pay the owners in ICP.

// This is the version that connects to an ETH wallet.
// We will use this to allow user's to create their own node.
// This will depend on how it's stored with NFTs and such, but we'll figure out as it gets implemented.
// For now we will be the default and only node provider.


// Config.js
// module.exports = {
//   network: "devnet",
//   url: "https://devnet.irys.xyz",
//   providerUrl: "https://ethereum-sepolia-rpc.publicnode.com",
//   token: "ethereum",
// };

import React, { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { ethers } from "ethers";
import { WebIrys } from "@irys/sdk";

function BookUploadPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [connectedAddress, setConnectedAddress] = useState("");

  const getWebIrys = async () => {
    let provider;
    //@ts-ignore
    if (window.ethereum == null) {
      console.log("MetaMask not installed; using read-only defaults");
      provider = ethers.getDefaultProvider();
    } else {
      //@ts-ignore
      provider = new ethers.BrowserProvider(window.ethereum);
    }
    console.log("provider=", provider);
    const network = "mainnet";
    const token = "ethereum";

    const wallet = { name: "ethersv6", provider: provider };
    const webIrys = new WebIrys({ network, token, wallet });
    await webIrys.ready();
    setConnectedAddress(webIrys.address!);
  };

  return (
    <MainLayout>
      <div className="flex-grow flex items-start p-4 gap-4">
        <div className="basis-1/4 flex flex-col items-start gap-10">
          {/* Add your sidebar content here */}
        </div>

        <div className="basis-3/4">
          {/* Add your main content here */}
          <h1>Irys Connection</h1>
          {connectedAddress && connectedAddress.length > 0 && (
            <h3>Connected from: {connectedAddress}</h3>
          )}
          <button onClick={getWebIrys}>Connect To Irys Node</button>
        </div>
      </div>
    </MainLayout>
  );
}

export default BookUploadPage;