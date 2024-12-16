import React from "react";
import {
	Dialog,
	DialogContent,
} from "@/lib/components/dialog";

import SignupForm from "./components/SignupForm";

const FullPageSignup = () => (
    <Dialog open>
        <DialogContent
            closeIcon={null}
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="font-roboto-condensed outline-none mx-auto max-w-md bg-white p-8 text-[#828282]"
        >
            <SignupForm />
        </DialogContent>
    </Dialog>
)

export default FullPageSignup;