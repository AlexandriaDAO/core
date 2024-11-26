import React from "react";
import { useNavigate } from "react-router-dom";
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
                Become Librarian to create your personal nodes and
                access librarian profile data
            </span>
            <Button
                variant={"link"}
                scale={"sm"}
                onClick={() => navigate('/librarian')}>
                <span>Become Librarian</span>
            </Button>
        </div>
	);
}

export default NonLibrarianView;