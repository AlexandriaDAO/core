import React, { ReactNode, useEffect } from "react";
import Header from "@/components/Header";
import Categories from "@/features/categories";
import { ethers } from "ethers";
// Define the type for the component's props
interface MainLayoutProps {
	children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
	useEffect(()=>{
		// const wallet = ethers.Wallet.createRandom();
		// const pvt = wallet.privateKey
		// const pub = wallet.publicKey
		// const address = wallet.address
	
		// console.log(pvt, pub, address);

		// 0x00377061cb545e130a8bf0a623b4ff7a31320b2871378db1f14834e490b27961 0x025226c3a8983de4c7d61a6bfeb0f552617965ddf6c0a0857bcd2553e99ef6a16f 0x34127d91472f40c56284DeeF85052fff766444Fd
		// 0x1c185a7bd11f77a635c6bc28ceabefda8288e36f986cc501f1dc95e7abbbacde 0x022e457110586b72467b57e70539bd53332608fc621f604e504015bd30ff9d32f7 0x3A1d24e2f63f826bb820CC6D596F45B260d1DE40

		// const wallet = new ethers.Wallet('0x54d8a539123e15c56028557bff8b0704728138fdc04c04363374ca80efa16084');

		// console.log(wallet);
		// console.log(wallet.address);

	},[])
    
	return (
		<div className="min-h-screen min-w-screen flex flex-col bg-[#f4f4f4]">
			<Header />

			{children}
		</div>
	);
};

export default MainLayout;
