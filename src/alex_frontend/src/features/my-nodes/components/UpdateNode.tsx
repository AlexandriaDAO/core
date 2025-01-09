import React, { useEffect } from "react";

import { toast } from "sonner";

import { SerializedNode, setUpdating } from "../myNodesSlice";
import { useUser } from "@/hooks/actors";
import { Button } from "@/lib/components/button";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import updateNodeStatus from "../thunks/updateNodeStatus";
import { LoaderCircle } from "lucide-react";

interface UpdateNodeProps {
	node: SerializedNode;
}

const UpdateNode = ({ node }: UpdateNodeProps) => {
	if(!node) return null;
	const dispatch = useAppDispatch();
	const {actor} = useUser();

	const {updating} = useAppSelector((state) => state.myNodes);

	const handleToggleNodeActivation = ()=>{
        dispatch(setUpdating(node.id))
    }

    useEffect(()=>{
        if(updating !== node.id) return;

        if(!actor) {
            toast('Failed, Try later!!!')
            return;
        }

        dispatch(updateNodeStatus({actor, id: updating, active: !node.active}))
    },[node, updating, actor, dispatch])

	if(updating === node.id) 	return (
		<Button
			variant="info"
			scale="sm"
			className="flex-grow"
			disabled
		>
			<LoaderCircle size={14} className="animate animate-spin text-white" /> {node.active ? 'Deactivating' : 'Activating'}
		</Button>
	);


	return (
		<Button
			variant="info"
			scale="sm"
			onClick={handleToggleNodeActivation}
			className="flex-grow"
		>
			{node.active ? 'Deactivate' : 'Activate'}
		</Button>
	);
};

export default UpdateNode;