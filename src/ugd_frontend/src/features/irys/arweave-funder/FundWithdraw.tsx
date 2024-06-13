import React, { useEffect, useState } from "react";
import Button from "../components/MultiButton";
import Spinner from "../components/Spinner";
import getIrys from "../utils/getIrys";
import BigNumber from "bignumber.js";

interface FundWithdrawConfigProps {
  fundOnly?: boolean;
  withdrawOnly?: boolean;
}

export const FundWithdraw: React.FC<FundWithdrawConfigProps> = ({ fundOnly = false, withdrawOnly = false }) => {
  const [amount, setAmount] = useState<string>("0.0");
  const [isFunding, setIsFunding] = useState<boolean>(!withdrawOnly);
  const [message, setMessage] = useState<string>("");
  const [txProcessing, setTxProcessing] = useState<boolean>(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value);

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => setIsFunding(e.target.value === "fund");

  useEffect(() => {
    const getCurBalance = async () => {
      try {
        const irys = await getIrys();
        const loadedBalance = await irys.getLoadedBalance();
        if (!isFunding) setAmount(irys.utils.fromAtomic(loadedBalance).toString());
      } catch (error) {
        console.log("Error connecting to Irys:", error);
      }
    };
    getCurBalance();
  }, [isFunding]);

  const handleFundWithdraw = async () => {
    setMessage("");
    if (amount === "0") {
      setMessage("Please enter an amount greater than 0");
      return;
    }

    const irys = await getIrys();
		console.log("Irys object:", irys);

    setTxProcessing(true);

    if (isFunding) {
      try {
				console.log("Did not get into await_irys.fund");

				// I'm getting stuck right here on this line with TypeError: provider.estimateGas is not a function
        await irys.fund(irys.utils.toAtomic(new BigNumber(amount)));
				console.log("Got into await_irys.fund");
        setMessage("Funding successful");
      } catch (e) {
        setMessage("Error while funding: " + e);
        console.log(e);
      }
    } else {
      try {
        await irys.withdrawBalance(irys.utils.toAtomic(new BigNumber(amount)));
        setMessage("Withdraw successful");
      } catch (e) {
        setMessage("Error while withdrawing: " + e);
        console.log(e);
      }
    }
    setTxProcessing(false);
  };

  return (
    <div className="bg-white rounded-lg p-5 border w-full shadow-xl">
      <input
        type="number"
        step="0.0000001"
        className="block w-full mb-4 bg-transparent text-text rounded-md p-3 border border-gray-300 shadow-sm"
        value={amount}
        onChange={handleAmountChange}
      />
      {!fundOnly && !withdrawOnly && (
        <div className="my-6 text-text flex items-center space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="transactionType"
              value="fund"
              checked={isFunding}
              onChange={handleOptionChange}
            />
            <span className="ml-2">Fund</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="transactionType"
              value="withdraw"
              checked={!isFunding}
              onChange={handleOptionChange}
            />
            <span className="ml-2">Withdraw</span>
          </label>
        </div>
      )}
      {message && <div className="text-red-500">{message}</div>}
      <Button onClick={handleFundWithdraw} disabled={txProcessing}>
        {txProcessing ? <Spinner color="text-background" /> : isFunding ? "Fund Node" : "Withdraw From Node"}
      </Button>
    </div>
  );
};

export default FundWithdraw;



















// import React from "react";
// import { useEffect, useState } from "react";

// import Button from "../components/MultiButton";
// import Select, { SingleValue, ActionMeta } from "react-select";
// import Spinner from "../components/Spinner";
// import getIrys from "../utils/getIrys";
// import BigNumber from "bignumber.js";

// interface OptionType {
// 	value: string;
// 	label: string;
// }

// const networks: OptionType[] = [
// 	{ value: "mainnet", label: "Mainnet" },
// 	{ value: "devnet", label: "Devnet" },
// ];

// const currencies: OptionType[] = [
// 	{ value: "aptos", label: "Aptos" },
// 	{ value: "algorand", label: "Algorand" },
// 	{ value: "arbitrum", label: "Arbitrum" },
// 	{ value: "arweave", label: "Arweave" },
// 	{ value: "avalanche", label: "Avalanche" },
// 	{ value: "boba", label: "Boba" },
// 	{ value: "boba-eth", label: "Boba-ETH" },
// 	{ value: "chainlink", label: "Chainlink" },
// 	{ value: "ethereum", label: "Ethereum" },
// 	{ value: "fantom", label: "Fantom" },
// 	{ value: "near", label: "Near" },
// 	{ value: "matic", label: "Matic" },
// 	{ value: "solana", label: "Solana" },
// ];

// interface FundWithdrawConfigProps {
// 	network?: string;
// 	currency?: string;
// 	fundOnly?: boolean;
// 	withdrawOnly?: boolean;
// }

// export const FundWithdraw: React.FC<FundWithdrawConfigProps> = ({
// 	network = "",
// 	currency = "",
// 	fundOnly = false,
// 	withdrawOnly = false,
// }) => {
// 	const initialSelectedNetwork = network ? networks.find((n) => n.value === network) || null : null;
// 	const initialSelectedCurrency = currency ? currencies.find((c) => c.value === currency) || null : null;

// 	let initialIsFunding = fundOnly || !withdrawOnly;
// 	if (withdrawOnly) initialIsFunding = false;

// 	const [selectedNetwork, setSelectedNetwork] = useState<OptionType | null>(initialSelectedNetwork);
// 	const [selectedCurrency, setSelectedCurrency] = useState<OptionType | null>(initialSelectedCurrency);
// 	const [amount, setAmount] = useState<string>("0.0");
// 	const [isFunding, setIsFunding] = useState<boolean>(initialIsFunding);
// 	const [message, setMessage] = useState<string>("");
// 	const [txProcessing, setTxProcessing] = useState<boolean>(false);

// 	const handleNodeChange = (selectedOption: SingleValue<OptionType>, _actionMeta: ActionMeta<OptionType>) => {
// 		setSelectedNetwork(selectedOption as OptionType);
// 	};

// 	const handleCurrencyChange = (selectedOption: SingleValue<OptionType>, _actionMeta: ActionMeta<OptionType>) => {
// 		setSelectedCurrency(selectedOption as OptionType);
// 	};

// 	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value);

// 	const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => setIsFunding(e.target.value === "fund");

// 	useEffect(() => {
// 		setAmount("0");
// 		const getCurBalance = async () => {
// 			try {
// 				const irys = await getIrys(selectedNetwork?.value, selectedCurrency?.value);
// 				const loadedBalance = await irys.getLoadedBalance();
// 				// Show currently funded balance iff we're in withdraw mode
// 				if (!isFunding) setAmount(irys.utils.fromAtomic(loadedBalance).toString());
// 			} catch (error) {
// 				console.log("Error connecting to Irys:", error);
// 			}
// 		};
// 		if (selectedNetwork && selectedCurrency) getCurBalance();
// 	}, [selectedNetwork, selectedCurrency, isFunding]);

// 	const handleFundWithdraw = async () => {
// 		setMessage("");
// 		// Validate input
// 		if (!selectedNetwork) {
// 			setMessage("Please select a network to fund");
// 			return;
// 		}
// 		if (!selectedCurrency) {
// 			setMessage("Please select to currency to use when funding");
// 			return;
// 		}
// 		if (amount === "0") {
// 			setMessage("Please enter an amount greater than 0");
// 			return;
// 		}

// 		// Validation passed, get a reference to an Irys object
// 		const irys = await getIrys(selectedNetwork?.value, selectedCurrency?.value);
// 		console.log(irys);
// 		setTxProcessing(true);

// 		// If fund mode do fund
// 		if (isFunding) {
// 			try {
// 				const fundTx = await irys.fund(irys.utils.toAtomic(new BigNumber(amount)));
// 				setMessage("Funding successful");
// 			} catch (e) {
// 				setMessage("Error while funding: " + e);
// 				console.log(e);
// 			}
// 		} else {
// 			// If withdraw mode, do withdraw
// 			try {
// 				const fundTx = await irys.withdrawBalance(irys.utils.toAtomic(new BigNumber(amount)));
// 				setMessage("Withdraw successful");
// 			} catch (e) {
// 				setMessage("Error while withdrawing: " + e);
// 				console.log(e);
// 			}
// 		}
// 		setTxProcessing(false);
// 	};

// 	return (
// 		<div className="bg-white rounded-lg p-5 border w-full shadow-xl">
// 			{!network && (
// 				<Select
// 					className="mb-4"
// 					options={networks}
// 					onChange={handleNodeChange}
// 					value={selectedNetwork}
// 					placeholder="Select a network..."
// 				/>
// 			)}
// 			{!currency && (
// 				<Select
// 					className="mb-4"
// 					options={currencies}
// 					onChange={handleCurrencyChange}
// 					value={selectedCurrency}
// 					placeholder="Select a currency..."
// 				/>
// 			)}
// 			<input
// 				type="number"
// 				step="0.0000001"
// 				className="block w-full mb-4 bg-transparent text-text rounded-md p-3 border border-gray-300 shadow-sm"
// 				value={amount}
// 				onChange={handleAmountChange}
// 			/>
// 			{!fundOnly && !withdrawOnly && (
// 				<div className="my-6 text-text flex items-center space-x-4">
// 					<label className="inline-flex items-center">
// 						<input
// 							type="radio"
// 							className="form-radio"
// 							name="transactionType"
// 							value="fund"
// 							checked={isFunding}
// 							onChange={handleOptionChange}
// 						/>
// 						<span className="ml-2">Fund</span>
// 					</label>
// 					<label className="inline-flex items-center">
// 						<input
// 							type="radio"
// 							className="form-radio"
// 							name="transactionType"
// 							value="withdraw"
// 							checked={!isFunding}
// 							onChange={handleOptionChange}
// 						/>
// 						<span className="ml-2">Withdraw</span>
// 					</label>
// 				</div>
// 			)}
// 			{message && <div className="text-red-500">{message}</div>}
// 			<Button onClick={handleFundWithdraw} disabled={txProcessing}>
// 				{txProcessing ? <Spinner color="text-background" /> : isFunding ? "Fund Node" : "Withdraw From Node"}
// 			</Button>
// 		</div>
// 	);
// };

// export default FundWithdraw; // FundWithdraw

// /* 
// USAGE:
// - Default: 
//   <FundWithdraw />

// - To fix the network:
//   <FundWithdraw network = "mainnet" />

// - To fix the currency:
//   <FundWithdraw currency= "ethereum"  />

// - To set component to fund-only:
//   <FundWithdraw fundOnly ={ true } />

// - To set the component to withdraw-only:
//   <FundWithdraw withdrawOnly ={ true } />

// Note:
// * One of fundOnly and withdrawOnly must be true. In case both are set to false, the component defaults to fund only mode.
// */
