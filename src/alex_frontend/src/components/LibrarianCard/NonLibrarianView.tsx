import React from "react";
import { useNavigate } from "react-router";
import { Button } from "@/lib/components/button";
import { LockKeyhole } from "lucide-react";

function NonLibrarianView() {
	const navigate = useNavigate();

	return (
        <div className="flex flex-col items-center justify-between gap-3">
            <div className="p-2 bg-muted border border-ring rounded-full">
                <LockKeyhole size={22} className="text-primary"/>
            </div>
            <span className="font-roboto-condensed font-medium text-base">
                COMING SOON, you will be able to save and share your own API keys to upload to Arweave, and use other Web2 APIs.
            </span>
            <Button
                variant={"link"}
                scale={"sm"}
                // onClick={() => navigate('/dashboard/profile/upgrade')}>

                disabled={true}
                className="opacity-50 cursor-not-allowed"
            >
                <span>Become Librarian</span>
            </Button>
        </div>
	);
}

NonLibrarianView.displayName = 'NonLibrarianView';

export default NonLibrarianView;