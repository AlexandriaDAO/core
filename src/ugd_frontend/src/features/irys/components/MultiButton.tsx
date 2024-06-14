// import React from "react";

// interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
//   children?: React.ReactNode;
// }

// const MultiButton: React.FC<ButtonProps> = ({ children, onClick, ...props }) => {
//   return (
//     <div className="w-full">
//       <button
//         {...props}
//         type="button"
//         className="w-full justify-center text-md flex items-center gap-2 rounded-full px-4 py-3 font-robotoMono uppercase hover:font-bold lg:px-6 lg:py-5 bg-black text-white"
//         onClick={onClick}
//       >
//         {children}
//       </button>
//     </div>
//   );
// };
               
// export default MultiButton;



import React from "react";
import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { etherIrys, nearIrys, phantomIrys, rainbowKitIrys, walletConnectIrys } from "./auth/initializers";

import { Button } from "./ui/button";
import WalletButton from "./WalletButton";
import useCheckWalletConnection from "./hooks/useCheckWalletConnection";
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children?: React.ReactNode;
	checkConnect?: boolean;
	requireLitAuth?: boolean;
}

const MultiButton: React.FC<ButtonProps> = ({
	children,
	onClick,
	checkConnect = true,
	requireLitAuth = false,
	...props
}) => {
	const [connecting, setConnecting] = useState(false);
	const [hasLitToken, setHasLitToken] = useState(false);
	const [isOpen, setIsOpen] = useState(false); // State to control the Dialog open status
	const [connected, provider, address, blockchain] = useCheckWalletConnection();
	const [walletConnected, setWalletConnected] = useState<boolean>(false);

	useEffect(() => {
		if (connected) {
			setWalletConnected(true);
		}
	}, [connected]);

	const handleConnect = async (method: () => Promise<any>) => {
		setConnecting(true);
		try {
			const walletConnectMethod = await method();
			if (walletConnectMethod) {
				setWalletConnected(true);
				setIsOpen(false); // Close the dialog on successful connection
			}
		} catch (error) {
			console.error(error);
		} finally {
			setConnecting(false);
		}
	};

	return !checkConnect || walletConnected ? (
		<div className="w-full">
			<button
				{...props}
				type="button"
				className="w-full justify-center text-md flex items-center gap-2 rounded-full px-4 py-3 font-robotoMono uppercase hover:font-bold lg:px-6 lg:py-5 bg-black text-white"
				onClick={onClick}
			>
				{children}
			</button>
		</div>
	) : (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					onClick={() => setIsOpen(true)} // Open the dialog when the button is clicked
					variant={"secondary"}
					className="w-full justify-center text-md flex items-center gap-2 rounded-full px-4 py-3 font-robotoMono uppercase hover:font-bold lg:px-6 lg:py-5 bg-black text-white"
				>
					Connect Wallet
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Select one wallet to continue</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<WalletButton text="Metamask" onClick={() => handleConnect(etherIrys)} />
					<WalletButton text="Phantom" onClick={() => handleConnect(phantomIrys)} />
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default MultiButton;

{
	/* <WalletButton text="RainbowKit" onClick={() => handleConnect(rainbowKitIrys)} />
<WalletButton text="Near" onClick={() => handleConnect(nearIrys)} />
<WalletButton text="WalletConnect" onClick={() => handleConnect(walletConnectIrys)} /> */
}


