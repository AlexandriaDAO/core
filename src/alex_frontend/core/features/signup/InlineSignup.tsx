import React, { useState } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";

import { Dialog, DialogContent, DialogTrigger } from "@/lib/components/dialog";

import Processing from "@/components/Processing";
import SignupForm from "./components/SignupForm";
import { X } from "lucide-react";
import { useLogout } from "@/hooks/useLogout";

const InlineSignup = () => {
    const logout = useLogout();
	const {loading } = useAppSelector(state=>state.signup)
    const [open, setOpen] = useState(true);

	// if(loading) return <Processing message="Signing up..." />

    return (
        <div className="flex justify-center items-center gap-2">
            <Dialog open={open}>
                <DialogTrigger>
                    {loading ? <Processing message="Signing up..." /> :
                        <div onClick={()=>setOpen(true)} className="flex-shrink h-auto flex justify-between gap-1 px-4 py-2 items-center border border-white text-[#828282] hover:text-white rounded-full cursor-pointer transition-all duration-300">
                            <span className="text-base font-normal font-roboto-condensed tracking-wider">
                                Signup
                            </span>
                        </div>
                    }
                </DialogTrigger>

                <DialogContent
                    closeIcon={<X size={20} onClick={()=>setOpen(false)}/>}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    className="font-roboto-condensed outline-none mx-auto max-w-md p-8"
                >
                    <SignupForm />
                </DialogContent>
            </Dialog>
            <div onClick={logout} className="flex-shrink h-auto flex justify-between gap-1 px-4 py-2 items-center border border-white text-[#828282] hover:text-white rounded-full cursor-pointer transition-all duration-300">
                <span className="text-base font-normal font-roboto-condensed tracking-wider">
                    Disconnect
                </span>
            </div>
        </div>
    )
}

export default InlineSignup;