import React, { useState, useEffect } from "react";
import Spinner from "./Spinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children?: React.ReactNode;
	scheme?: ButtonScheme;
	checkConnect?: boolean;
}

export enum ButtonScheme {
	black = "black",
	white = "white",
}

const Button: React.FC<ButtonProps> = ({ children, scheme, onClick, checkConnect = true, ...props }) => {
	const [connected, setConnected] = useState(false);
	const [connecting, setConnecting] = useState(false);

	useEffect(() => {
		if (checkConnect) {
			const checkConnection = async () => {
				//@ts-ignore
				const provider = new ethers.providers.Web3Provider(window.ethereum);
				const accounts = await provider.listAccounts();
				setConnected(accounts && accounts.length > 0);
			};

			checkConnection();
		}
	}, [checkConnect]);

	const handleConnect = async (event: React.MouseEvent) => {
		event.preventDefault();
		setConnecting(true);
		try {
			//@ts-ignore
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			await provider.send("eth_requestAccounts", []);
			setConnected(true);
		} catch (error) {
			console.error("Failed to connect:", error);
		}
		setConnecting(false);
	};

	const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		if (!checkConnect || (connected && onClick)) {
			onClick && onClick(event);
		} else {
			handleConnect(event);
		}
	};

	if (!scheme) scheme = ButtonScheme.black;

	return (
		<button
			{...props}
			type="button"
			className={`
				w-full justify-center text-md flex items-center gap-2 rounded-full px-4 py-3 font-robotoMono uppercase hover:font-bold lg:px-6 lg:py-5
				${
					{
						[ButtonScheme.black]: "bg-black text-white",
						[ButtonScheme.white]: "bg-white text-black",
					}[scheme]
				}
			`}
			onClick={handleButtonClick}
		>
			{checkConnect && !connected ? (
				connecting ? (
					<Spinner color="text-background" />
				) : (
					"Connect Wallet"
				)
			) : (
				children
			)}
		</button>
	);
}; // Button

export default Button;
