import React, { useEffect } from 'react';
import { useState } from 'react';
import useSession from '@/hooks/useSession';
import LbryRatio from "./components/swap/lbryRatio"
import GetSubaccountBal from "./components/getSubaccountBal"
import { useNavigate } from 'react-router-dom';
import GetaccountBal from '../icp-ledger/components/getAccountBal';
import PerformSwap from './components/swap/performSwap';
import "./style.css"
import LbryBurnRatio from './components/burn/lbryBurnRatio';
import PerformBurn from './components/burn/performBurn';
import PerformStake from './components/stake/performStake';
import GetAlexBal from './components/getAlexBal';
import GetStakedInfo from './components/stake/getStakedInfo';


const Swap = () => {
	const { actorSwap, actorIcpLedger, actorTokenomics, actorLbry,actorAlex, authClient } = useSession();
	const navigate = useNavigate();

	const checkIsAuth = async () => {
		if (!await authClient?.isAuthenticated()) {
			navigate("/");
		}
	}
	useEffect(() => {
		checkIsAuth();
	}, [authClient])
	return (
		<div className='custom-container'>
			<div className='account-container bg-white shadow-lg'>
				<GetSubaccountBal actorSwap={actorSwap} actorLbry={actorLbry}></GetSubaccountBal>
				<GetaccountBal actorIcpLedger={actorIcpLedger}></GetaccountBal>
				<GetAlexBal  actorAlex={actorAlex} />
			</div>
			<div className='swap-container-wrapper flex gap-5 justify-center'>
				<div className='swap-container bg-white shadow-lg'>
					<div className='header'>
						<h1 className='text-center mb-5'>Swap ICP to LBRY</h1>
						<LbryRatio actorSwap={actorSwap}></LbryRatio>
					</div>
					<PerformSwap actorSwap={actorSwap} />
				</div>
				<div className='swap-container bg-white shadow-lg'>
					<div className='header'>
						<h1 className='text-center mb-5'>Burn Lbry</h1>
						<LbryBurnRatio actorSwap={actorSwap} actorTokenomics={actorTokenomics}></LbryBurnRatio>
					</div>
					<PerformBurn actorSwap={actorSwap} actorLbry={actorLbry} />
				</div>
			</div>
			<div className='swap-container-wrapper flex gap-5 justify-center'>
				<div className='swap-container bg-white shadow-lg'>
					<div className='header'>
						<h1 className='text-center mb-5'>Stake ALEX</h1>
					</div>
					<GetStakedInfo actorSwap={actorSwap}/>
					<PerformStake actorSwap={actorSwap} actorAlex={actorAlex}  />
				</div>
			</div>

		</div>
	);
}
export default Swap;
