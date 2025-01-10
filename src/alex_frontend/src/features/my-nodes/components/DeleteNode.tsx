import React, { useEffect } from "react";

import { toast } from "sonner";

import { LoaderCircle, Trash2 } from "lucide-react";
import { SerializedNode, setDeleting } from "../myNodesSlice";
import { useUser } from "@/hooks/actors";
import { Button } from "@/lib/components/button";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import deleteNode from "../thunks/deleteNode";
import { useAppSelector } from "@/store/hooks/useAppSelector";

interface DeleteNodeProps {
	node: SerializedNode;
}

const DeleteNode = ({ node }: DeleteNodeProps) => {
	if(!node) return null;
	const dispatch = useAppDispatch();
	const {actor} = useUser();

	const {deleting} = useAppSelector((state) => state.myNodes);

	const handleDeleteNode = ()=>{
        dispatch(setDeleting(node.id))
    }
	useEffect(()=>{
        if(deleting !== node.id) return;

        if(!actor) {
			toast('Failed, Try later!!!')
            return;
        }

        dispatch(deleteNode({actor, node}))
    },[node, deleting, actor, dispatch])

	if(deleting === node.id) 	return (
		<Button
			variant="destructive"
			scale="sm"
			className="flex-grow"
            disabled
		>
			<LoaderCircle size={14} className="animate animate-spin text-white" /> Deleting
		</Button>
	);


    return (
		<Button
            variant="destructive"
            scale="sm"
            onClick={handleDeleteNode}
            className="flex-grow"
        >
            <Trash2 size={14} />
            <span>Delete</span>
        </Button>
	);
};

export default DeleteNode;
