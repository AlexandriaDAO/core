import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { WebIrys } from "@irys/sdk";
import { getNodeBalance, getServerIrys } from "@/services/irysService";
import { Info, LoaderCircle, RefreshCcw } from "lucide-react";
import { useAlexWallet, useUser } from "@/hooks/actors";
import { SerializedNode } from "@/features/my-nodes/myNodesSlice";
import { DialogClose } from "@/lib/components/dialog";
import { Button } from "@/lib/components/button";
import { useUploader } from "@/hooks/useUploader";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { nextScreen, setNode, setOpen } from "../uploadSlice";
import fetchNodes from "../thunks/fetchNodes";

const NodeRow: React.FC<{ item: SerializedNode }> = ({ item }) => {
	const dispatch = useAppDispatch();
	const {actor} = useAlexWallet();
	const {node} = useAppSelector(state => state.upload);

	const {setIrys:setUploaderIrys} = useUploader();

	const [irys, setIrys] = useState<WebIrys | null>(null);
	const [loading, setLoading] = useState(false);

	const [balance, setBalance] = useState<number>(-1);
	const [balanceLoading, setBalanceLoading] = useState(false);

	const setNodeBalance = async () => {
		if(!irys) {
			setBalance(-1);
			return;
		}

		setBalanceLoading(true);
		try {
			const balance = await getNodeBalance(irys);
			setBalance(balance);
		} catch (error) {
			console.error('Error fetching balance:', error);
			toast.error('Failed to fetch balance');
			setBalance(-1);
		} finally {
		  	setBalanceLoading(false);
		}
	};

	useEffect(() => {
		setNodeBalance();
	}, [irys]);

	const setServerIrys = async () => {
		setLoading(true);
		try{
			if (!actor) {
				throw new Error("No actor available");
			}
			const serverIrys = await getServerIrys(item, actor);
			setIrys(serverIrys);
		}catch(error){
			if (error instanceof Error) {
				toast.error(error.message);
			}else{
				console.log('error loading web irys', error);
				toast.error('unable to load wallet')
			}
			setIrys(null);
		}finally{
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!item||!actor) return;
		setServerIrys();
	}, [item, actor]);


	useEffect(() => {
		if (!node || node.id !== item.id) return;
		setUploaderIrys(irys)
	}, [item, node]);

	if (loading) {
		return (
			<tr >
				<td colSpan={5} className="text-center p-4">
					<div className="flex items-center justify-center gap-1">
						<span className="text-md">Loading Node</span>
						<LoaderCircle size={12} className="animate-spin inline-block mr-2" />
					</div>
				</td>
			</tr>
		);
	}

	return (
		<tr
			key={item.id}
			className={`cursor-pointer ${
				node?.id === item.id ? "bg-gray-200" : ""
			}`}
			onClick={() => dispatch(setNode(item))} // Make the entire row clickable
		>
			<td className="p-2 text-left ">
				<input
					type="radio"
					checked={node?.id === item.id}
					onChange={() => dispatch(setNode(item))}
				/>
			</td>
			<td className="p-2">{item.owner.toString().slice(0, 5) + "..." + item.owner.toString().slice(-3)}</td>
			<td className="p-2">{irys?.token ? irys.token : 'NA'}</td>
			<td className="p-2 flex items-center justify-center gap-1">
				{balanceLoading ? (
					<LoaderCircle size={14} className="animate-spin" />
				) : balance === -1 ? (
					<Button
						title="Unable to fetch balance"
						disabled={true}
						variant="destructive"
						rounded="full"
						scale="icon"
						className="p-0"
					>
						<Info size={20}/>
					</Button>
				) : (
					<span className="font-bold">{balance}</span>
				)}
			</td>
		</tr>
	)
};

const SelectNode = () => {
	const {actor} = useUser();
	const dispatch = useAppDispatch();
	const {node,nodes, loading} = useAppSelector(state => state.upload);

	const refresh = useCallback(()=>{
        if(!actor) return;
        dispatch(fetchNodes(actor))
	},[actor, dispatch, fetchNodes])

	useEffect(refresh, [refresh]);

	return (
		<div className="flex flex-col gap-2">
			<div className="flex justify-between items-center">
				<p className="text-sm font-roboto-condensed">Choose a node to use for your Asset Upload</p>
				<div onClick={refresh} className="flex justify-between items-center gap-1 cursor-pointer focus:outline-none hover:bg-gray-300 p-1 rounded-md">
					<RefreshCcw className={`${loading ? 'animate-spin' : ''}`} size={14}  />
					<p className="p-1 size text-xs">
						Refresh
					</p>
				</div>
			</div>
			<div className="text-center overflow-auto max-h-[300px] w-full bg-gray-100 border shadow rounded">
				<table className="min-w-full border-collapse w-full">
					<thead>
						<tr>
							<th className="p-2 text-left">Select</th>
							<th className="p-2">Owner</th>
							<th className="p-2">Token</th>
							<th className="p-2">Balance</th>
						</tr>
					</thead>
					<tbody>
						{nodes.filter(item => item.active).map(item => <NodeRow key={item.id} item={item} /> )}
					</tbody>
				</table>
			</div>
			<footer className="flex justify-between items-center">
				<Button onClick={() => dispatch(nextScreen())} type="button" disabled={!node} variant={!node ? "inverted" : "info"}>
					Next
				</Button>

				<DialogClose asChild>
					<Button onClick={()=>dispatch(setOpen(false))} type="button" variant="outline">Close</Button>
				</DialogClose>
			</footer>
		</div>
	);
};

export default SelectNode;