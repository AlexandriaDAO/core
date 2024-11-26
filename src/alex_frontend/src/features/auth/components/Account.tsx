import React from "react";
import { Copy, LogOut } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/lib/components/dialog";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Button } from "@/lib/components/button";
import { toast } from "sonner";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useLogout } from "@/hooks/useLogout";

const Account = () => {
    const logout = useLogout();
    const {user} = useAppSelector(state=>state.auth);

    const handleCopy = ()=>{
        if (user?.principal) {
            navigator.clipboard.writeText(user.principal);
            toast.success('Copied to clipboard');
        } else {
            toast.error('No address to copy');
        }
    }
	return (
        <Dialog>
            <DialogTrigger>
                <div className="flex-shrink h-auto flex justify-center items-center gap-1 px-4 py-2 border border-solid border-white text-[#828282] hover:text-white rounded-full cursor-pointer duration-300 transition-all">
                    <span className="text-base font-normal font-roboto-condensed tracking-wider">
                        {user?.principal.slice(0, 6) + "..." + user?.principal.slice(-4)}
                    </span>
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-[600px] flex flex-col font-roboto-condensed">
                <DialogTitle>Principal</DialogTitle>
                <div className="flex justify-between items-center gap-2 text-lg">
                    {user?.principal}
                </div>
                <div className="flex justify-center gap-2 items-center">
                    <Button type="button" rounded={"full"} className="self-center" onClick={handleCopy}>
                        <span>Copy To Clipboard</span>
                        <Copy size={20} />
                    </Button>
                    <Button type="submit" rounded={"full"} className="self-center" onClick={logout}>
                        <span>Logout</span>
                        <LogOut size={20} />
                    </Button>
                </div>

            </DialogContent>
        </Dialog>
	);
}

export default Account;