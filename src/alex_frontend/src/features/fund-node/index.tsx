import React, { useEffect, useState } from "react";
import { WebIrys } from "@irys/sdk";
import { ImSpinner8 } from "react-icons/im";
import { message } from "antd";
import { getClientIrys } from "@/services/irysService";
import { LiaSaveSolid } from "react-icons/lia";
import { Button } from "@/lib/components/button";

const FundNode = () => {
	const [irys, setIrys] = useState<WebIrys | null>(null);
	const [amount, setAmount] = useState("0.0001");
	const [loading, setLoading] = useState(false);
	const [fundLoading, setFundLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const setWebIrys = async () => {
		setLoading(true);
		try {
			const webIrys = await getClientIrys();
			setIrys(webIrys);
			setError(null);
		} catch (error) {
			if (error instanceof Error) {
				setError(error.message);
			} else {
				console.log('error loading web irys', error);
				setError('Unable to load wallet or connect to Irys');
			}
			setIrys(null);
		} finally {
			setLoading(false);
		}
	};

	const fund = async () => {
		if(!irys) {
			message.error("Irys is not available");
			return;
		}
		setFundLoading(true);
		try {
			const confirmation = window.confirm(
				`Funding the node will deduct ${amount} ETH from your wallet. Do you want to proceed?`
			);
			if (confirmation) {
				console.log('confirmed');
				const fundTx = await irys.fund(
					irys.utils.toAtomic(amount)
				);
				console.log(fundTx, 'fundTx');

				message.success(
					`Transaction has been submitted for ${irys.utils.fromAtomic(
						fundTx.quantity
					)} ${irys.token}`
				);
			}
		} catch (e) {
			message.error(
				"Funding Failed, Try Again."
			);
			console.log("Error funding node ", e);
		} finally {
			setFundLoading(false);
		}
	};

	if (!irys) {
		return (
			<div className="w-full p-3 shadow-lg rounded-xl bg-white">
				<div className="font-syne font-medium text-xl text-black mb-2">
					Connect Wallet to Fund Library
				</div>
				<Button onClick={setWebIrys} disabled={loading} variant="inverted">
					{loading ? (
						<span className="flex gap-1 items-center">
							Connecting <ImSpinner8 size={14} className="animate animate-spin" />
						</span>
					) : (
						"Connect Wallet"
					)}
				</Button>
				{error && (
					<div className="bg-red-100 border-l-4 border-red-500 p-4 mt-4">
						<p className="font-roboto-condensed text-sm text-red-700">
							{error}
						</p>
					</div>
				)}
			</div>
		);
	}

	return (
        <div className={`relative ${loading ? 'cursor-not-allowed pointer-events-none' : ''}`}>
            <div className={`w-full p-3 flex flex-col shadow-lg rounded-xl bg-white ${loading ? 'opacity-40' : ''}`}>
                <div className="font-syne font-medium text-xl text-black mb-2">
                    Fund Your Library
                </div>
                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
                    <ul className="list-disc pl-5 font-roboto-condensed text-sm">
                        <li>Make sure you have added your node.</li>
                        <li>Make sure you are connected to right wallet, whose node you want to depost balance to.</li>
                        <li>If you are connected to wallet whose node is not stored, You will not see updated balance.</li>
                        <li>In above case you will need to create a node first to see the balance for that node.</li>
                    </ul>
                </div>
				<div className="flex flex-col gap-4 justify-between items-start p-2 shadow border border-solid rounded font-roboto-condensed font-normal text-base">
					<div className="flex flex-col gap-2 justify-start items-start">
						<div className="flex justify-stretch items-center gap-2">
							<div className="relative flex justify-between items-center">
								<input
									disabled={fundLoading}
									type="number"
									step="0.0001"
									className={`py-1 pl-3 pr-10 text-text rounded-md border border-solid border-gray-300 shadow-sm ${fundLoading ? 'bg-gray-200 cursor-not-allowed':'bg-white'}`}
									placeholder="0,0000"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
								/>
								<span className="absolute right-3 font-bold">ETH</span>
							</div>
							<Button onClick={fund} scale="sm" disabled={fundLoading} variant="inverted">
								{fundLoading ? <span className="flex gap-1 items-center">
									Processing <ImSpinner8 size={14} className="animate animate-spin" />
								</span> : "Deposit" }
							</Button>
						</div>
					</div>
				</div>
            </div>
            {loading &&
                <div className="w-full h-full absolute inset-0 backdrop-blur flex justify-center items-center border border-solid  border-gray-400 rounded">
                    <span className="bg-black/100 shadow rounded p-2">
                        <ImSpinner8 size={14} className="animate animate-spin text-white" />
                    </span>
                </div>
            }
        </div>
	);
};

export default FundNode;