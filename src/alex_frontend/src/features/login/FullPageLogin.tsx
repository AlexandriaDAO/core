import React from "react";
import { Dialog, DialogContent } from "@/lib/components/dialog";
import LoginContent from "./components/LoginContent";

const FullPageLogin = () => (
	<Dialog open>
		<DialogContent className="sm:max-w-[425px] font-roboto-condensed" closeIcon={null} onOpenAutoFocus={(e) => e.preventDefault()}>
			<LoginContent />
		</DialogContent>
	</Dialog>
)

export default FullPageLogin;