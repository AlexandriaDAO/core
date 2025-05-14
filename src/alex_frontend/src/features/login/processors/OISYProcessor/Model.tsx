import React from "react";
import { Button } from "@/lib/components/button";
import LoginButton from "./LoginButton";
import { useSiwoIdentity } from "ic-use-siwo-identity";
import { LoaderCircle } from "lucide-react";

const Model = () => {
	const {
		isConnecting,
		connectOisyAccount,
		account,
		isAccountError,
		accountError,
	} = useSiwoIdentity();

	return (
		<div className="flex flex-col items-stretch w-full gap-4 p-2">
			<div className="flex items-center justify-start w-full gap-5">
				<div className="items-center justify-center hidden w-8 h-8 text-xl font-bold rounded-full md:flex bg-zinc-300 text-zinc-800">
					1
				</div>
				<div className="flex-1">
					{account ?
						<span>{account.owner.toText().slice(0, 6) + "..." + account.owner.toText().slice(-6)}</span>
					: <Button
						onClick={connectOisyAccount}
						variant="link"
						disabled={isConnecting}
						className="w-full justify-between"
					>
						{isConnecting ? (
							<>
								<LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
								Connecting...
							</>
						) : isAccountError ? "Try Again ..." : (
							"Connect OISY Wallet"
						)}
					</Button>}
					{isAccountError && ( <div className="flex flex-col items-center justify-center">
						<p className="text-red-500">{accountError?.message}</p>
					</div>)}
				</div>
			</div>
			<div className="flex items-center justify-center w-full gap-5">
				<div className="items-center justify-center hidden w-8 h-8 text-xl font-bold rounded-full md:flex bg-zinc-300 text-zinc-800">
					2
				</div>
				<div className="flex-1">
					<LoginButton />
				</div>
			</div>
		</div>
	);
};

export default Model;