import MainLayout from '@/layouts/MainLayout';
import React, { useEffect } from 'react';
import { useState } from 'react';
import useSession from '@/hooks/useSession';
import LbryRatio from "./components/swap/lbryRatio"
import GetSubaccount from "./components/getSubaccount"
import { useNavigate } from 'react-router-dom';
import GetaccountBal from '../icp-ledger/components/getAccountBal';
import PerformSwap from './components/swap/performSwap';
import "./style.css"
import LbryBurnRatio from './components/burn/lbryBurnRatio';
import PerformBurn from './components/burn/performBurn';

const Swap = () => {
	const { actorSwap, actorIcpLedger, actorTokenomics, actorLbry, authClient } = useSession();
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
				<GetSubaccount actorSwap={actorSwap} actorLbry={actorLbry}></GetSubaccount>
				<GetaccountBal actorIcpLedger={actorIcpLedger}></GetaccountBal>
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
		</div>
	);
}

export default Swap;