// This is the version using the web wallet.
import React, { useState, useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { ethers } from "ethers";
import { WebIrys } from "@irys/sdk";

function FundWithdraw() {
  const { user } = useAppSelector((state) => state.auth);
  const [connectedAddress, setConnectedAddress] = useState("");
  const [webIrys, setWebIrys] = useState<WebIrys | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
	const [amount, setAmount] = useState("0.0001");

  useEffect(() => {
    const fetchNodeDetails = async () => {
      if (webIrys) {
        try {
          const atomicBalance = await webIrys.getLoadedBalance();
          console.log("Atomic Balance: ", atomicBalance);
          //@ts-ignore
          const convertedBalance = parseFloat(webIrys.utils.fromAtomic(atomicBalance));
          setBalance(convertedBalance);
        } catch (error) {
          console.error("Error fetching node details:", error);
        }
      }
    };

    if (webIrys) {
      fetchNodeDetails();
    }
  }, [webIrys]);

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
    setWebIrys(webIrys);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const fundNode = async () => {
    if (webIrys) {
      try {
        const confirmation = window.confirm(
          "Funding the node will deduct ${amount} ETH from your wallet. Do you want to proceed?"
        );
        if (confirmation) {
          const fundTx = await webIrys.fund(webIrys.utils.toAtomic(0.0001));
          console.log(
            `Successfully funded ${webIrys.utils.fromAtomic(fundTx.quantity)} ${
              webIrys.token
            }`
          );
        }
      } catch (e) {
        console.log("Error funding node ", e);
      }
    }
  };

	return (
		<div className="bg-white rounded-lg p-5 border w-full shadow-xl">
			<h1>Irys Connection</h1>
			{connectedAddress && connectedAddress.length > 0 && (
				<h3>Connected from: {connectedAddress}</h3>
			)}
			<button onClick={getWebIrys} className="mb-4 bg-blue-500 text-white px-4 py-2 rounded">
				Connect To Irys Node
			</button>
			{webIrys && (
				<div>
					<input
						type="number"
						step="0.0000001"
						className="block w-full mb-4 bg-transparent text-text rounded-md p-3 border border-gray-300 shadow-sm"
						value={amount}
						onChange={handleAmountChange}
					/>
					<button onClick={fundNode} className="bg-blue-500 text-white px-4 py-2 rounded">
						Fund Node
					</button>
				</div>
			)}
			{balance !== null && (
				<div>
					<h3>Node Balance: {balance} ETH</h3>
					{balance <= 0.00001 && (
						<p>Balance is within 10% of 0, please fund your node.</p>
					)}
				</div>
			)}
			{status && (
				<div>
					<h3>Node Status: {status}</h3>
				</div>
			)}
		</div>
	);
}

export default FundWithdraw;