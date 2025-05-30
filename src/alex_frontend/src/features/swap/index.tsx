import React, { lazy, Suspense } from 'react';

const NftManagerActor = lazy(() => import("@/actors").then(module => ({ default: module.NftManagerActor })));
const LbryActor = lazy(() => import("@/actors").then(module => ({ default: module.LbryActor })));
const AlexActor = lazy(() => import("@/actors").then(module => ({ default: module.AlexActor })));
const IcpSwapActor = lazy(() => import("@/actors").then(module => ({ default: module.IcpSwapActor })));
const TokenomicsActor = lazy(() => import("@/actors").then(module => ({ default: module.TokenomicsActor })));
const IcpLedgerActor = lazy(() => import("@/actors").then(module => ({ default: module.IcpLedgerActor })));
const LogsActor = lazy(() => import("@/actors").then(module => ({ default: module.LogsActor })));

const SwapMain = lazy(() => import("./swapMain"));

const Swap = () => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<LbryActor>
				<AlexActor>
					<IcpSwapActor>
						<NftManagerActor>
							<TokenomicsActor>
								<IcpLedgerActor>
									<LogsActor>
										<SwapMain/>
									</LogsActor>
								</IcpLedgerActor>
							</TokenomicsActor>
						</NftManagerActor>
					</IcpSwapActor>
				</AlexActor>
			</LbryActor>
		</Suspense>
	);
}

export default Swap;
