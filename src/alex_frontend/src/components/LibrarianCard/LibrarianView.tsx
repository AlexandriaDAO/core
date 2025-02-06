import React from "react";
import { useNavigate } from "react-router";
import { Button } from "@/lib/components/button";
import { Check } from "lucide-react";

function LibrarianView() {
	const navigate = useNavigate();
	return (
        <div className="flex flex-col items-center justify-between gap-3">
            <div className="p-2 bg-muted border rounded-full">
                <Check size={22} className="text-constructive"/>
            </div>
            <span className="font-roboto-condensed font-medium text-base">
                You are a Librarian, You can Add Nodes.
            </span>
            <Button
                variant={"link"}
                scale={"sm"}
                onClick={()=>navigate("/dashboard")}>
                View Home
            </Button>
        </div>
    )
}

export default LibrarianView;