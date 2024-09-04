import React, { useEffect } from 'react';
import { useState } from 'react';
import useSession from '@/hooks/useSession';
import LbryRatio from "./components/swap/lbryRatio"
import GetSubaccountLBRYBal from "./components/getSubaccountLBRYBal"
import GetaccountBal from '../icp-ledger/components/getAccountBal';
import PerformSwap from './components/swap/performSwap';
import "./style.css"
import LbryBurnRatio from './components/burn/lbryBurnRatio';
import PerformBurn from './components/burn/performBurn';
import PerformStake from './components/stake/performStake';
import GetAlexBal from './components/getAlexBal';
import GetStakedInfo from './components/stake/getStakedInfo';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import TransferTokens from './components/transfer/transferTokens';


const Swap = () => {
	const { actorSwap, actorIcpLedger, actorTokenomics, actorLbry, actorAlex } = useSession();
	const auth = useAppSelector(state => state.auth);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const checkIsAuth = async () => {
		if (auth.user === "") {
			setIsAuthenticated(false);
		}
		else {
			setIsAuthenticated(true);
		}
	}
	useEffect(() => {
		checkIsAuth();
	}, [auth])
	return (
		<div className='custom-container'>
			<div className='account-container bg-white shadow-lg'>
				<GetSubaccountLBRYBal actorSwap={actorSwap} actorLbry={actorLbry}></GetSubaccountLBRYBal > 
				<GetaccountBal actorIcpLedger={actorIcpLedger} actorSwap={actorSwap} isAuthenticated={isAuthenticated}></GetaccountBal>
				<GetAlexBal actorAlex={actorAlex} />
			</div>
			<div className='swap-container-wrapper flex gap-5 justify-center'>
				<div className='swap-container bg-white shadow-lg'>
					<div className='header'>
						<h1 className='text-center mb-5'>Swap ICP to LBRY</h1>
						<LbryRatio actorSwap={actorSwap}></LbryRatio>
					</div>
					<PerformSwap actorSwap={actorSwap} isAuthenticated={isAuthenticated} />
				</div>
				<div className='swap-container bg-white shadow-lg'>
					<div className='header'>
						<h1 className='text-center mb-5'>Burn Lbry</h1>
						<LbryBurnRatio actorSwap={actorSwap} actorTokenomics={actorTokenomics}></LbryBurnRatio>
					</div>
					<PerformBurn actorSwap={actorSwap} actorLbry={actorLbry} isAuthenticated={isAuthenticated} />
				</div>
			</div>
			<div className='swap-container-wrapper flex gap-5 justify-center'>
				<div className='swap-container bg-white shadow-lg'>
					<div className='header'>
						<h1 className='text-center mb-5'>Stake ALEX</h1>
					</div>
					<GetStakedInfo actorSwap={actorSwap} isAuthenticated={isAuthenticated} />
					<PerformStake actorSwap={actorSwap} actorAlex={actorAlex} isAuthenticated={isAuthenticated} />
				</div>
			</div>
			<div className='swap-container-wrapper flex gap-5 justify-center'>
				<div className='swap-container bg-white shadow-lg'>
					<div className='header'>
						<h1 className='text-center mb-5'>Transfer</h1>
					</div>
					<TransferTokens actorIcpLedger={actorIcpLedger} actorLbry={actorLbry} actorAlex={actorAlex} isAuthenticated={isAuthenticated} />
				</div>
			</div>

		</div>
	);
}
export default Swap;
