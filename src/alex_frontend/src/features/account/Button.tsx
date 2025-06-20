import React from "react";
import { LogOut } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTrigger } from "@/lib/components/dialog";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useLogout } from "@/hooks/useLogout";
import Copy from "@/components/Copy";
import { AccountIdentifier } from "@dfinity/ledger-icp";
import { Principal } from "@dfinity/principal";

const AccountButton = () => {
    const logout = useLogout();
    const {user} = useAppSelector(state=>state.auth);

    if(!user) return null;

    const accountId = user ? AccountIdentifier.fromPrincipal({principal: Principal.fromText(user.principal)}).toHex().toString() : '';

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="flex-shrink h-auto w-max flex justify-center items-center gap-1 px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 text-white hover:text-white/90 hover:border-white rounded-full cursor-pointer duration-300 transition-all">
                    <img alt="Internet Computer" className="inline-block w-4 h-4 mr-1" src="/images/ic.svg" />
                    <span className="text-base font-normal font-roboto-condensed tracking-wider">
                        {user.principal.slice(0, 6) + "..." + user.principal.slice(-4)}
                    </span>
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-[600px] flex flex-col font-roboto-condensed" closeIcon={null} onOpenAutoFocus={(e) => e.preventDefault()}>
                <div>
                    <DialogTitle className="font-medium">ICP Account</DialogTitle>
                    <DialogDescription>
                        Your ICP Principal is a unique identifier for your account on the Internet Computer blockchain. You can use it to interact with various dApps and services.
                    </DialogDescription>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="">
                        <Label htmlFor="principal" className="font-normal" >
                            Principal ID
                        </Label>
                        <div className="relative">
                            <Input
                                id="principal"
                                type="text"
                                value={user.principal}
                                readOnly
                                className="pr-10 overflow-x-auto scrollbar-none font-light font-mono"
                            />
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <Copy text={user.principal} />
                            </div>
                        </div>
                    </div>

                    <div className="">
                        <Label htmlFor="principal" className="font-normal" >
                            Account ID
                        </Label>
                        <div className="relative">
                            <Input
                                id="account"
                                type="text"
                                value={accountId}
                                readOnly
                                className="pr-10 overflow-x-auto scrollbar-none font-light font-mono"
                            />
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <Copy text={accountId} />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex justify-between sm:justify-between items-center gap-2">
                    <Button onClick={logout} variant="info">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </Button>

                    <DialogClose asChild>
                        <Button type="button" variant="inverted">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
	);
}

export default AccountButton;