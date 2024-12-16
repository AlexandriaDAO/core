import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";

import { Dialog, DialogContent, DialogTrigger } from "@/lib/components/dialog";

import Processing from "@/components/Processing";
import SignupForm from "./components/SignupForm";

const InlineSignup = () => {
	const {loading } = useAppSelector(state=>state.signup)

	if(loading) return <Processing message="Signing up..." />

    return (
        <Dialog>
            <DialogTrigger>
                <div className="flex-shrink h-auto flex justify-between gap-1 px-4 py-2 items-center border border-white text-[#828282] hover:text-white rounded-full cursor-pointer transition-all duration-300">
                    <span className="text-base font-normal font-roboto-condensed tracking-wider">
                        Signup
                    </span>
                </div>
            </DialogTrigger>

            <DialogContent
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="font-roboto-condensed outline-none mx-auto max-w-md bg-white p-8 text-[#828282]"
            >
                <SignupForm />
            </DialogContent>
        </Dialog>
    )
}

export default InlineSignup;