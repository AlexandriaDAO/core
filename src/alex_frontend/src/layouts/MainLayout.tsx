import React, { ReactNode, useEffect } from "react";
import Header from "@/components/Header";
import { Toaster } from "@/lib/components/sonner";
// Define the type for the component's props
interface MainLayoutProps {
	children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {


	useEffect(()=>{
		// const wallet = require('ethers').Wallet.createRandom();
		// const pvt = wallet.privateKey
		// const pub = wallet.publicKey
		// const address = wallet.address

		// console.log(pvt, pub, address);
		// 0x1b22b79ef5b08fbf4d862933b41da8dd112b15bc2a78122609ffd539d795119b
		// 0x033cf6eef83358f5d67f254635cba52732b4f935092eb81a977e1b0e8fc807a6de
		// 0x16fA6A2ace0f1c93c647Ec32B203C54A8f7dCB77


		// 0x00377061cb545e130a8bf0a623b4ff7a31320b2871378db1f14834e490b27961 0x025226c3a8983de4c7d61a6bfeb0f552617965ddf6c0a0857bcd2553e99ef6a16f 0x34127d91472f40c56284DeeF85052fff766444Fd
		// 0x1c185a7bd11f77a635c6bc28ceabefda8288e36f986cc501f1dc95e7abbbacde 0x022e457110586b72467b57e70539bd53332608fc621f604e504015bd30ff9d32f7 0x3A1d24e2f63f826bb820CC6D596F45B260d1DE40

		// const wallet = new ethers.Wallet('0x54d8a539123e15c56028557bff8b0704728138fdc04c04363374ca80efa16084');

		// console.log(wallet);
		// console.log(wallet.address);


		// ibe_encrypt(actorVetkd, '9k3ZRQbtB2CQ4pagHmYSuFQNEP4ePTIfpdt41aM4McY', 'yj5ba-aiaaa-aaaap-qkmoa-cai').then(console.log)

	},[])

	return (
		<div className="min-h-screen min-w-screen flex flex-col bg-[#f4f4f4]">
			<Header />
			{children}
			<Toaster />
		</div>
	);
};

export default MainLayout;
