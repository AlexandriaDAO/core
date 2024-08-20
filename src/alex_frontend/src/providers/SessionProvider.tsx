import React, { useEffect, useState } from 'react';
import { alex_backend } from '../../../declarations/alex_backend';
import { AuthClient } from "@dfinity/auth-client";
import { useAppSelector } from '@/store/hooks/useAppSelector';
import SessionContext from '@/contexts/SessionContext';
import MeiliSearch, { Index } from 'meilisearch';
import { initializeClient, initializeIndex } from '@/services/meiliService';
// import fetchMyEngines from '@/features/my-engines/thunks/fetchMyEngines';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import principal from '@/features/auth/thunks/principal';
import fetchBooks from '@/features/portal/thunks/fetchBooks';
import { initializeActor, initializeIcrc7Actor, initializeNftManagerActor, initializeActorSwap,initializeIcpLedgerActor, initializeLbryActor, initializeTokenomicsActor,initializeAlexActor } from '@/features/auth/utils/authUtils';
import { icrc7 } from '../../../declarations/icrc7';
import { nft_manager } from '../../../declarations/nft_manager';
import { icp_swap } from '../../../declarations/icp_swap';
import { icp_ledger_canister } from "../../../declarations/icp_ledger_canister";
import { tokenomics } from '../../../declarations/tokenomics';
import { LBRY } from '../../../declarations/LBRY';
import { ALEX } from '../../../declarations/ALEX';


interface SessionProviderProps {
	children: React.ReactNode;
}

// authClient > user > actor > my-engines > [meiliclient, meiliindex]
const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
	const dispatch = useAppDispatch();
	const {user} = useAppSelector(state=>state.auth);
	const { books } = useAppSelector(state=>state.portal);

	const [actor, setActor] = useState(alex_backend);
	const [actorIcrc7, setActorIcrc7] = useState(icrc7);
	const [actorNftManager, setActorNftManager] = useState(nft_manager);
	const [actorSwap,setActorSwap]=useState(icp_swap);
	const [actorIcpLedger, setIcpLedger] = useState(icp_ledger_canister);
	const [actorTokenomics, setActorTokenomics] = useState(tokenomics);
	const [actorLbry,setActorLbry]=useState(LBRY);
	const [actorAlex,setActorAlex]=useState(ALEX);

	const [authClient, setAuthClient] = useState<AuthClient>();
	const [meiliClient, setMeiliClient] = useState<MeiliSearch>();
	const [meiliIndex, setMeiliIndex] = useState<Index>();


	const initializeAuthClient = async () => {
		const authClient = await AuthClient.create();
		setAuthClient(authClient);
	}

	const initializeMeiliClient = async () => {
		const host = process.env.REACT_MEILI_HOST;
		const key = process.env.REACT_MEILI_KEY;

		const client = await initializeClient(host, key);
		if(client){
			const {results} = await client.getIndexes()
			results.forEach(index=>{
				client.deleteIndexIfExists(index.uid)
			})
		}
		if(client) setMeiliClient(client)
	}

	useEffect(()=>{
		initializeAuthClient()
		initializeMeiliClient()
	},[])


	useEffect(()=>{
		if(!authClient) return;

		dispatch(principal(authClient))
	},[authClient])

	useEffect(()=>{
		if(!authClient) return;

		const setupActor = async()=>{
			const actor = await initializeActor(authClient);
			setActor(actor);
			const actorIcrc7 = await initializeIcrc7Actor(authClient);
			setActorIcrc7(actorIcrc7);
			const actorNftManager = await initializeNftManagerActor(authClient);
			setActorNftManager(actorNftManager);
			const actorSwap = await initializeActorSwap(authClient);
			setActorSwap(actorSwap);
			const actorIcpLedger = await initializeIcpLedgerActor(authClient);
			setIcpLedger(actorIcpLedger);
			const actorTokenomics=await initializeTokenomicsActor(authClient);
			setActorTokenomics(actorTokenomics);
			const actorLbry=await initializeLbryActor(authClient);
			setActorLbry(actorLbry);
			const actorAlex=await initializeAlexActor(authClient);
			setActorAlex(actorAlex);
		}
		setupActor();
	},[user])

	useEffect(()=>{
		setMeiliIndex(undefined)
		if(!user || !meiliClient) return;

		const setupMeiliIndex = async()=>{

			const index = await initializeIndex(meiliClient, user)

			if(index) setMeiliIndex(index)
		}
		setupMeiliIndex();
	},[user, meiliClient])

	// Load 10 books on app start.
	useEffect(() => {
    if(!actor) return;
    dispatch(fetchBooks(actorNftManager));
}, [actor, dispatch]);

	return (
		<SessionContext.Provider value={{ actor,actorIcrc7,actorNftManager,actorSwap,actorIcpLedger,actorTokenomics, actorLbry,actorAlex,authClient, meiliClient, meiliIndex  }}>
			{children}
		</SessionContext.Provider>
	);
};

export default SessionProvider