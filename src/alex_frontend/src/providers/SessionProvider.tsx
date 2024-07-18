import React, { useEffect, useState } from 'react';
import { createActor, alex_backend } from '../../../declarations/alex_backend';
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";
import { useAppSelector } from '@/store/hooks/useAppSelector';
import SessionContext from '@/contexts/SessionContext';
import MeiliSearch, { Index } from 'meilisearch';
import { initializeClient, initializeIndex } from '@/services/meiliService';
import { setUser } from '@/features/auth/authSlice';
import fetchMyEngines from '@/features/my-engines/thunks/fetchMyEngines';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import principal from '@/features/auth/thunks/principal';
import { initializeActor, initializeActorSwap,initializeIcpLedgerActor, initializeLbryActor, initializeTokenomicsActor } from '@/features/auth/utils/authUtils';
import { icp_swap } from '../../../declarations/icp_swap';
import { icp_ledger_canister } from "../../../declarations/icp_ledger_canister";
import { tokenomics } from '../../../declarations/tokenomics';
import { LBRY } from '../../../declarations/LBRY';

interface SessionProviderProps {
	children: React.ReactNode;
}

// authClient > user > actor > my-engines > [meiliclient, meiliindex]
const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
	const dispatch = useAppDispatch();
	const {user} = useAppSelector(state=>state.auth);
	const {engines} = useAppSelector(state=>state.myEngines)

	const [actor, setActor] = useState(alex_backend);
	const [actorSwap,setActorSwap]=useState(icp_swap);
	const [actorIcpLedger, setIcpLedger] = useState(icp_ledger_canister);
	const [actorTokenomics, setActorTokenomics] = useState(tokenomics);
	const [actorLbry,setActorLbry]=useState(LBRY);
	const [authClient, setAuthClient] = useState<AuthClient>();

	const [meiliClient, setMeiliClient] = useState<MeiliSearch>();
	const [meiliIndex, setMeiliIndex] = useState<Index>();


	const initializeAuthClient = async () => {
		const authClient = await AuthClient.create();
		setAuthClient(authClient);
	}

	useEffect(()=>{
		initializeAuthClient()
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
			const actorSwap = await initializeActorSwap(authClient);
			setActorSwap(actorSwap);
			const actorIcpLedger = await initializeIcpLedgerActor(authClient);
			setIcpLedger(actorIcpLedger);
			const actorTokenomics=await initializeTokenomicsActor(authClient);
			setActorTokenomics(actorTokenomics);
			const actorLbry=await initializeLbryActor(authClient);
			setActorLbry(actorLbry);
		}
		setupActor();
	},[user])

	useEffect(()=>{
		if(engines.length <1 ) {
			setMeiliClient(undefined);
			return;
		}
		const setupMeili = async()=>{
			engines.find(async (engine) => {
				const client = await initializeClient(engine.host, engine.key);
				if(!client) return false;

				setMeiliClient(client)

				const index = await initializeIndex(client, engine.index)
				if(index){
					setMeiliIndex(index)
				}

				return true;
			})
		}
		setupMeili();
	},[engines])


	useEffect(() => {
		if (actor!=alex_backend){
			dispatch(fetchMyEngines(actor));
		}
	}, [actor,actorSwap,actorIcpLedger]);

	return (
		<SessionContext.Provider value={{ actor,actorSwap,actorIcpLedger,actorTokenomics, actorLbry,authClient, meiliClient, meiliIndex  }}>
			{children}
		</SessionContext.Provider>
	);
};

export default SessionProvider