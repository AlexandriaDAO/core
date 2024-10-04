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
import { initializeActor,
    initializeIcrc7Actor,
    initializeNftManagerActor,
    initializeActorSwap,
    initializeIcpLedgerActor,
    initializeLbryActor,
    initializeTokenomicsActor,
    initializeAlexActor,
	initializeActorAlexLibrarian,
	initializeActorAlexWallet,
	initializeActorVetkd
} from '@/features/auth/utils/authUtils';
import { icrc7 } from '../../../declarations/icrc7';
import { nft_manager } from '../../../declarations/nft_manager';
import { icp_swap } from '../../../declarations/icp_swap';
import { icp_ledger_canister } from "../../../declarations/icp_ledger_canister";
import { tokenomics } from '../../../declarations/tokenomics';
import { LBRY } from '../../../declarations/LBRY';
import { ALEX } from '../../../declarations/ALEX';
import { alex_librarian } from '../../../declarations/alex_librarian';
import { createActor as createAlexWalletActor, canisterId as alexWalletCanisterId }  from '../../../declarations/alex_wallet';
import { vetkd } from '../../../declarations/vetkd';
import fetchMyEngines from '@/features/my-engines/thunks/fetchMyEngines';
import { setEngines } from '@/features/my-engines/myEnginesSlice';


interface SessionProviderProps {
	children: React.ReactNode;
}

// authClient > user > actor > my-engines > [meiliclient, meiliindex]
const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
	const dispatch = useAppDispatch();
	const { user } = useAppSelector(state => state.auth);
	const { books } = useAppSelector(state => state.portal);
	const {engines} = useAppSelector(state=>state.myEngines)
	const {activeEngine} = useAppSelector(state=>state.engineOverview)

	const [actor, setActor] = useState(alex_backend);
	const [actorAlexLibrarian, setActorAlexLibrarian] = useState(alex_librarian);
	const [actorAlexWallet, setActorAlexWallet] = useState(createAlexWalletActor(alexWalletCanisterId));
	const [actorVetkd, setActorVetkd] = useState(vetkd);
	const [actorIcrc7, setActorIcrc7] = useState(icrc7);
	const [actorNftManager, setActorNftManager] = useState(nft_manager);
	const [actorSwap,setActorSwap]=useState(icp_swap);
	const [actorIcpLedger, setIcpLedger] = useState(icp_ledger_canister);
	const [actorTokenomics, setActorTokenomics] = useState(tokenomics);
	const [actorLbry, setActorLbry] = useState(LBRY);
	const [actorAlex, setActorAlex] = useState(ALEX);

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

		const client = await initializeClient(host, key, actorVetkd);
		// if(client){
		// 	const {results} = await client.getIndexes()
		// 	results.forEach(index=>{
		// 		client.deleteIndexIfExists(index.uid)
		// 	})
		// }
		if(client) {
			setMeiliClient(client)

			const index = await initializeIndex(client, user || 'anonymous')
			if (index) setMeiliIndex(index)
		}
	}

	// setup auth client and default meiliclient
	useEffect(() => {
		initializeAuthClient()
		initializeMeiliClient()
	}, [])


	// setup user principal when user login/logout
	useEffect(() => {
		if (!authClient) return;

		dispatch(principal(authClient))
	}, [authClient])

	// setup different canister actors
	useEffect(()=>{
		if(!authClient) return;

		// console.log('logged in ', authClient.isAuthenticated());

		const setupActor = async()=>{

			setActor(await initializeActor(authClient));

			setActorAlexLibrarian(await initializeActorAlexLibrarian(authClient));

			setActorAlexWallet(await initializeActorAlexWallet(authClient));

			setActorVetkd(await initializeActorVetkd(authClient));

			setActorSwap(await initializeActorSwap(authClient));

			setIcpLedger(await initializeIcpLedgerActor(authClient));

			setActorTokenomics(await initializeTokenomicsActor(authClient));

			setActorLbry(await initializeLbryActor(authClient));

			setActorAlex(await initializeAlexActor(authClient));

			setActorIcrc7(await initializeIcrc7Actor(authClient));

			setActorNftManager(await initializeNftManagerActor(authClient));

		}
		setupActor();
	},[user])

	// Load 10 books on app start.
	useEffect(() => {
		if(!actorNftManager) return;
		dispatch(fetchBooks(actorNftManager));

	}, [actorNftManager, dispatch]);

	// Load user engines when actor changes / when user logs in
	useEffect(() => {
		// fetch logged in user engines
		if (actor!=alex_backend){
			dispatch(fetchMyEngines(actor));
		}
	}, [actor, dispatch]);


	// setup meilisearch client when user engines change
	useEffect(()=>{
		const setupMeili = async()=>{
			const engineAvailable = engines.find(async (engine) => {
				// if engines exist, initialize meilisearch client with engines host and key

				const client = await initializeClient(engine.host, engine.key, actorVetkd);
				if(!client) return false;
				setMeiliClient(client)

				const index = await initializeIndex(client, engine.index)
				if(index) setMeiliIndex(index)

				return true;
			})

			if(!engineAvailable){
				initializeMeiliClient();
			}
		}
		setupMeili();
	},[engines])


	useEffect(()=>{
		if(activeEngine){
			const updatedEngines = engines.map(engine => engine.id === activeEngine.id ? activeEngine : engine);
			dispatch(setEngines(updatedEngines));
		}
	},[activeEngine])

	return (
		<SessionContext.Provider value={{ actor, actorAlexLibrarian, actorAlexWallet, actorVetkd, actorSwap,actorIcpLedger,actorTokenomics, actorLbry, actorAlex, actorIcrc7, actorNftManager,authClient, meiliClient, meiliIndex  }}>
			{children}
		</SessionContext.Provider>
	);
};

export default SessionProvider