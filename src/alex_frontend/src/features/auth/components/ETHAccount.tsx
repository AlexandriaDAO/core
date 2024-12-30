import React from "react";
import { Copy, LogOut } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTrigger } from "@/lib/components/dialog";
import { Button } from "@/lib/components/button";
import { toast } from "sonner";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useLogout } from "@/hooks/useLogout";
import { useAccount, useDisconnect } from "wagmi";

const ETHAccount = () => {
    const logout = useLogout();
    const { address, isConnected, isConnecting } = useAccount();
    const { disconnect } = useDisconnect();


    const handleCopy = ()=>{
        if (address) {
            navigator.clipboard.writeText(address);
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
                    <img alt="Ethereum" className="inline-block w-4 h-4 mr-1 " src="/images/ethereum.svg" />
                    <span className="text-base font-normal font-roboto-condensed tracking-wider">
                        {address?.slice(0, 6) + "..." + address?.slice(-4)}
                    </span>
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-[600px] flex flex-col font-roboto-condensed">
                <div>
                    <DialogTitle>Ethereum Address</DialogTitle>
                    <DialogDescription>
                        Your Ethereum address is a unique identifier for your account on the Ethereum blockchain. You can use it to interact with various dApps and services.
                    </DialogDescription>
                </div>
                <div className="flex justify-between items-center gap-2 text-lg">
                    {address}
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

export default ETHAccount;