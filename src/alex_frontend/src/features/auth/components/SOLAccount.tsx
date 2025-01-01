import React from "react";
import { Copy, LogOut } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTrigger } from "@/lib/components/dialog";
import { Button } from "@/lib/components/button";
import { toast } from "sonner";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useLogout } from "@/hooks/useLogout";
import { useAccount, useDisconnect } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";

const SolAccount = () => {
    const logout = useLogout();
    const { publicKey, connected } = useWallet();

    const { disconnect } = useDisconnect();


    const handleCopy = ()=>{
        if (publicKey) {
            navigator.clipboard.writeText(publicKey.toBase58());
            toast.success('Copied to clipboard');
        } else {
            toast.error('No address to copy');
        }
    }

    const handleDisconnect = ()=>{
        disconnect();
        logout();
    }
	return (
        <Dialog>
            <DialogTrigger>
                <div className="flex-shrink h-auto flex justify-center items-center gap-1 px-4 py-2 border border-solid border-white text-[#828282] hover:text-white rounded-full cursor-pointer duration-300 transition-all">
                    <img alt="Solana" className="inline-block w-4 h-4 mr-1 " src="/images/solana.svg" />
                    <span className="text-base font-normal font-roboto-condensed tracking-wider">
                        {publicKey?.toBase58()?.slice(0, 6) + "..." + publicKey?.toBase58()?.slice(-4)}
                    </span>
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-[600px] flex flex-col font-roboto-condensed">
                <div>
                    <DialogTitle>Solana Address</DialogTitle>
                    <DialogDescription>
                        Your Solana address is a unique identifier for your account on the Solana blockchain. You can use it to interact with various dApps and services.
                    </DialogDescription>
                </div>
                <div className="flex justify-between items-center gap-2 text-lg">
                    {publicKey?.toBase58()}
                </div>
                <div className="flex justify-center gap-2 items-center">
                    <Button type="button" rounded={"full"} className="self-center" onClick={handleCopy}>
                        <span>Copy To Clipboard</span>
                        <Copy size={20} />
                    </Button>
                    <Button type="submit" rounded={"full"} className="self-center" onClick={handleDisconnect}>
                        <span>Disconnect</span>
                        <LogOut size={20} />
                    </Button>
                </div>

            </DialogContent>
        </Dialog>
	);
}

export default SolAccount;