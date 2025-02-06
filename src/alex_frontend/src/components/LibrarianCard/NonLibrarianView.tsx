import React from "react";
import { useNavigate } from "react-router";
import { Button } from "@/lib/components/button";
import { LockKeyhole } from "lucide-react";

function NonLibrarianView() {
	const navigate = useNavigate();

	return (
        <div className="flex flex-col items-center justify-between gap-3">
            <div className="p-2 bg-muted border rounded-full">
                <LockKeyhole size={22} className="text-primary"/>
            </div>
            <span className="font-roboto-condensed font-medium text-base">
                Become Librarian to create your personal nodes and
                access librarian profile data
            </span>
            <Button
                variant={"link"}
                scale={"sm"}
                onClick={() => navigate('/dashboard/profile/upgrade')}>
                <span>Become Librarian</span>
            </Button>
        </div>
	);
}

NonLibrarianView.displayName = 'NonLibrarianView';

export default NonLibrarianView;