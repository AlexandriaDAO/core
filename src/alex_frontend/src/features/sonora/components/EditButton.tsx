import React from "react";
import { Edit } from "lucide-react";
import { Audio } from "../types";

interface EditButtonProps {
    item?: Audio;
}

export const EditButton: React.FC<EditButtonProps> = ({ item }) => {
    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        alert("Edit functionality coming soon!");
    };

    return (
        <div 
            className="p-3 rounded-full transition-all duration-200 bg-muted/50 opacity-0 group-hover:opacity-100 group-hover:bg-primary/90 group-hover:text-white cursor-pointer"
            onClick={handleEdit}
        >
            <Edit size={18} />
        </div>
    );
};