import { HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { createActor, ucg_backend } from '../../../../../declarations/ucg_backend';
import {icp_swap,createActor as createActorSwap} from "../../../../../declarations/icp_swap";
import {icp_ledger_canister,createActor as createActorIcpLedger} from "../../../../../declarations/icp_ledger_canister";
import { tokenomics,createActor as createActorTokenomics } from "../../../../../declarations/tokenomics";
import { LBRY,createActor as createActorLbry } from "../../../../../declarations/LBRY";



const backend_canister_id = process.env.CANISTER_ID_UCG_BACKEND!;
const icp_swap_canister_id = process.env.CANISTER_ID_ICP_SWAP!;
const icp_ledger_canister_id= process.env.CANISTER_ID!;
const tokenomics_canister_id=process.env.CANISTER_ID_TOKENOMICS!;
const lbry_canister_id=process.env.CANISTER_ID_LBRY!;
export const getPrincipal = (client:AuthClient): string => {
    const identity = client.getIdentity();
    const principal = identity.getPrincipal().toString();
    return principal;
}


export const initializeActor = async(client:AuthClient)=>{
    try{
        if(await client.isAuthenticated()){
            const identity = client.getIdentity();
            const agent = new HttpAgent({ identity });
            const actor = createActor( backend_canister_id , { agent });
            return actor;
        }
    }catch(error){
        console.error('Error initializing backend actor', error);
    }
    return ucg_backend;
}
export const initializeActorSwap = async(client:AuthClient)=>{
    try{
        if(await client.isAuthenticated()){
            const identity = client.getIdentity();
            const agent = new HttpAgent({ identity });
            const actor = createActorSwap( icp_swap_canister_id , { agent });
            return actor;
        }
    }catch(error){
        console.error('Error initializing swap actor', error);
    }
    return icp_swap;
}
export const initializeIcpLedgerActor = async(client:AuthClient)=>{
    try{
        if(await client.isAuthenticated()){
            const identity = client.getIdentity();
            const agent = new HttpAgent({ identity });
            const actor = createActorIcpLedger( icp_ledger_canister_id , { agent });
            return actor;
        }
    }catch(error){
        console.error('Error initializing icp actor', error);
    }
    return icp_ledger_canister;
}
export const initializeTokenomicsActor = async(client:AuthClient)=>{
    try{
        if(await client.isAuthenticated()){
            const identity = client.getIdentity();
            const agent = new HttpAgent({ identity });
            const actor = createActorTokenomics( tokenomics_canister_id , { agent });
            return actor;
        }
    }catch(error){
        console.error('Error initializing tokenomics actor', error);
    }
    return tokenomics;
}
export const initializeLbryActor = async(client:AuthClient)=>{
    try{
        if(await client.isAuthenticated()){
            const identity = client.getIdentity();
            const agent = new HttpAgent({ identity });
            const actor = createActorLbry( lbry_canister_id , { agent });
            return actor;
        }
    }catch(error){
        console.error('Error initializing Lbry actor', error);
    }
    return tokenomics;
}