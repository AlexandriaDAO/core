import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { WebIrys } from "@irys/sdk";
import { getNodeBalance, getPublicKey, getServerIrys } from "@/services/irysService";
import { AlertCircle, Check, RefreshCw, Server } from "lucide-react";
import { useAlexWallet } from "@/hooks/actors";
import { SerializedNode } from "@/features/my-nodes/myNodesSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { setNode } from "../fileUploadSlice";
import NodeSkeleton from "./NodeSkeleton";
import { formatAmount } from "../utils";

const minimumBalance = 0.000000000001 // Default minimum balance in ETH
const NodeItem: React.FC<{ item: SerializedNode }> = ({ item }) => {
	const dispatch = useAppDispatch();
	const {actor} = useAlexWallet();
	const {node, cost} = useAppSelector(state => state.fileUpload);

	const [irys, setIrys] = useState<WebIrys | null>(null);
	const [loading, setLoading] = useState(false);

	const [balance, setBalance] = useState<number>(-1);
	const [balanceLoading, setBalanceLoading] = useState(false);
    const [address, setAddress] = useState<string>("loading...");

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
				// toast.error(error.message);
				console.log(error.message);
			}else{
				console.log(error);
				// toast.error('unable to load wallet')
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
        const getAddress = async () => {
            try{
                if(!actor) { throw new Error("No actor available"); }
                if (!item) { throw new Error("No item available"); }
                const address = await getPublicKey(actor, item);
                setAddress(address);
            }catch(error){
                if (error instanceof Error) {
                    console.log(error.message);
                    // toast.error(error.message);
                }else{
                    console.log(error);
                    // toast.error('unable to load wallet')
                }
                setAddress('Unknown');
            }
        }
        getAddress();
    }, [item, actor]);

	if (loading) return <NodeSkeleton />;

    const selectable = () => {
        if (!irys) return false;
        if (balance <=0) return false;
        if (balance < minimumBalance) return false;
        if (cost && balance < cost) return false;
        return true;
      };

    return (
        <div
            onClick={() => selectable() && dispatch(setNode(item))}
            className={`relative p-4 rounded-lg border transition-all ${selectable() ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}
                ${node?.id === item.id ? 'border-blue-500 bg-blue-50' : selectable()
                    ? 'border-gray-200 hover:border-gray-300 bg-white'
                    : 'border-gray-200 bg-gray-50'
                }
            `}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Server className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
                    <div>
                        <h3 className="font-medium text-gray-900">{address && address.length > 15 ? address.toString().slice(0, 5) + "..." + address.toString().slice(-3): address}</h3>
                        {/* // <h3 className="font-medium text-gray-900">{address && address.length > 15 ? item.owner.toString().slice(0, 5) + "..." + item.owner.toString().slice(-3)}</h3> */}
                        {irys && balance > 0 && (
                            <p className={`text-sm ${balance < minimumBalance ? 'text-red-500' : 'text-gray-500'}`}>
                                {/* Token: {irys.token} ||  */}
                                Balance: {formatAmount(balance)}
                                {balance < minimumBalance && (
                                    <span className="ml-2 text-xs">
                                    (Minimum: {formatAmount(minimumBalance)})
                                    </span>
                                )}
                                {/* Balance: {balance} {irys.token}
                                {balance < minimumBalance && (
                                    <span className="ml-2 text-xs">
                                    (Minimum: {minimumBalance})
                                    </span>
                                )} */}
                            </p>
                        )}
                        {!irys && (
                            <p className="text-sm text-red-500 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" strokeWidth={2} />
                                Error fetching balance
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setNodeBalance();
                        }}
                        disabled={balanceLoading || !irys}
                        className={`bg-transparent rounded-md transition-all 
                            ${balanceLoading || !irys
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:text-gray-800'
                            }`}
                        >
                        <RefreshCw className={`w-4 h-4 ${balanceLoading ? 'animate-spin' : ''}`} strokeWidth={2} />
                    </button>
                    {node?.id === item.id && (
                        <div className="text-blue-500">
                            <Check className="w-5 h-5" strokeWidth={2} />
                        </div>
                    )}
                </div>
            </div>

            {!loading && !balanceLoading && !selectable() && (
                <div className="mt-2 text-xs text-red-500">
                    {!irys ? (
                        "Node is unavailable"
                    ) : balance > 0 && (balance < minimumBalance || (cost && (balance < cost))) ? (
                        "Insufficient balance to process uploads"
                    ) : balance <= 0 ? (
                        "No balance available"
                    ) : null}
                </div>
            )}
        </div>
    )

    // return (
    //     <div
    //         key={item.id}
    //         onClick={() => dispatch(setNode(item))}
    //         className={`p-4 rounded-lg border-2 transition-all duration-200 ${
    //             node?.id === item.id
    //                 ? 'border-blue-500 bg-blue-50'
    //                 : !irys || (balance ?? 0) <= 0
    //                     ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
    //                     : 'border-gray-200 hover:border-gray-300 cursor-pointer'
    //         }`}
    //     >
    //         <div className="flex items-center justify-between">
    //             <span className={`font-medium ${ !irys || (balance ?? 0) <= 0 ? 'text-gray-500' : 'text-gray-700'}`}
    //             >
    //                 {item.owner.toString().slice(0, 5) + "..." + item.owner.toString().slice(-3)}
    //             </span>
    //             <div className="flex items-center space-x-2">
    //                 {/* {renderNodeStatus(node)} */}
    //                 <button
    //                     onClick={(e) => {
    //                         e.stopPropagation();
    //                         setNodeBalance();
    //                     }}
    //                     className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
    //                     disabled={balanceLoading}
    //                 >
    //                     <svg
    //                         className={`w-4 h-4 ${balanceLoading ? 'animate-spin' : ''}`}
    //                         fill="none"
    //                         stroke="currentColor"
    //                         viewBox="0 0 24 24"
    //                     >
    //                         <path
    //                             strokeLinecap="round"
    //                             strokeLinejoin="round"
    //                             strokeWidth={2}
    //                             d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
    //                         />
    //                     </svg>
    //                 </button>
    //                 {node?.id === item.id && (
    //                     <svg
    //                         className="w-5 h-5 text-blue-500 flex-shrink-0 ml-2"
    //                         fill="none"
    //                         stroke="currentColor"
    //                         viewBox="0 0 24 24"
    //                     >
    //                         <path
    //                             strokeLinecap="round"
    //                             strokeLinejoin="round"
    //                             strokeWidth={2}
    //                             d="M5 13l4 4L19 7"
    //                         />
    //                     </svg>
    //                 )}
    //             </div>
    //         </div>
    //     </div>
    // )

	// return (
	// 	<tr
	// 		key={item.id}
	// 		className={`cursor-pointer ${
	// 			node?.id === item.id ? "bg-gray-200" : ""
	// 		}`}
	// 		onClick={() => dispatch(setNode(item))} // Make the entire row clickable
	// 	>
	// 		<td className="p-2 text-left ">
	// 			<input
	// 				type="radio"
	// 				checked={node?.id === item.id}
	// 				onChange={() => dispatch(setNode(item))}
	// 			/>
	// 		</td>
	// 		<td className="p-2">{item.owner.toString().slice(0, 5) + "..." + item.owner.toString().slice(-3)}</td>
	// 		<td className="p-2">{irys?.token ? irys.token : 'NA'}</td>
	// 		<td className="p-2 flex items-center justify-center gap-1">
	// 			{balanceLoading ? (
	// 				<LoaderCircle size={14} className="animate-spin" />
	// 			) : balance === -1 ? (
	// 				<Button
	// 					title="Unable to fetch balance"
	// 					disabled={true}
	// 					variant="destructive"
	// 					rounded="full"
	// 					scale="icon"
	// 					className="p-0"
	// 				>
	// 					<Info size={20}/>
	// 				</Button>
	// 			) : (
	// 				<span className="font-bold">{balance}</span>
	// 			)}
	// 		</td>
	// 	</tr>
	// )
};


export default NodeItem;



// {isLoadingNodes ? (
//     <NodesSkeleton />
// ) : nodesLoaded ? (
//     <div className="space-y-2">
//         {nodes.map((node) => (
//             <div
//                 key={node.id}
//                 onClick={() => handleNodeSelection(node.id)}
//                 className={`p-4 rounded-lg border-2 transition-all duration-200 ${
//                     selectedNode === node.id
//                         ? 'border-blue-500 bg-blue-50'
//                         : node.error || (node.balance ?? 0) <= 0
//                             ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
//                             : 'border-gray-200 hover:border-gray-300 cursor-pointer'
//                 }`}
//             >
//                 <div className="flex items-center justify-between">
//                     <span className={`font-medium ${
//                         node.error || (node.balance ?? 0) <= 0 
//                             ? 'text-gray-500' 
//                             : 'text-gray-700'
//                     }`}>
//                         {node.title}
//                     </span>
//                     <div className="flex items-center space-x-2">
//                         {renderNodeStatus(node)}
//                         <button
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleRefreshNodeBalance(node.id);
//                             }}
//                             className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
//                             disabled={refreshingNodeIds.has(node.id)}
//                         >
//                             <svg 
    //                                 className={`w-4 h-4 ${refreshingNodeIds.has(node.id) ? 'animate-spin' : ''}`} 
    //                                 fill="none" 
    //                                 stroke="currentColor" 
    //                                 viewBox="0 0 24 24"
    //                             >
    //                                 <path 
    //                                     strokeLinecap="round" 
    //                                     strokeLinejoin="round" 
    //                                     strokeWidth={2} 
    //                                     d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
    //                                 />
    //                             </svg>
    //                         </button>
    //                         {selectedNode === node.id && (
    //                             <svg
    //                                 className="w-5 h-5 text-blue-500 flex-shrink-0 ml-2"
    //                                 fill="none"
    //                                 stroke="currentColor"
    //                                 viewBox="0 0 24 24"
    //                             >
    //                                 <path
    //                                     strokeLinecap="round"
    //                                     strokeLinejoin="round"
    //                                     strokeWidth={2}
    //                                     d="M5 13l4 4L19 7"
    //                                 />
    //                             </svg>
    //                         )}
    //                     </div>
    //                 </div>
    //             </div>
    //         ))}
    //     </div>
    // ) : null}