import React, { useCallback, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import archived from '@/features/balance/icp/thunks/archived';
import redeem from '@/features/balance/icp/thunks/redeem';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/lib/components/button';
import { Card, CardContent } from '@/lib/components/card';
import { Alert } from '@/components/Alert';
import { useIcpSwap } from '@/hooks/actors';

const RedeemForm: React.FC = () => {
	const dispatch = useAppDispatch();
	const { actor } = useIcpSwap();

	const { archived: archivedBalance, archiveLoading, redeeming } = useAppSelector((state) => state.balance.icp);

	const handleRedeem = useCallback(async () => {
		if (!actor) return;
		try {
			await dispatch(redeem(actor)).unwrap();
			dispatch(archived())
		} catch (error) {}
	}, [actor]);


	useEffect(() => {
		dispatch(archived());
	}, []);

	return (
		<Card className="flex-grow">
			<CardContent className="pt-6">
				<div className="space-y-4">
					<div className="space-y-2">
						<div className="flex justify-between items-center">
							<span className="text-sm text-muted-foreground">Redeemable Balance:</span>
							<div className={`flex items-center space-x-2 ${archiveLoading ? 'opacity-50' : 'opacity-100'}`}>
								<span className="text-sm font-medium">
									{archivedBalance >= 0 ? archivedBalance.toFixed(4) : '0.0000'} ICP
								</span>
								<img className="w-8 h-8" src="/images/icp-logo.png" alt="ICP" />
								<Button
									type="button"
									variant="ghost"
									scale="icon"
									onClick={()=>dispatch(archived())}
									disabled={archiveLoading}
								>
									<RefreshCw size={14} className={`${archiveLoading ? 'animate-spin' : ''}`} />
								</Button>
							</div>
						</div>
					</div>

					<Button
						type="button"
						disabled={redeeming || archiveLoading || archivedBalance <= 0}
						variant='info'
						scale="md"
						className={`w-full ${redeeming || archivedBalance <= 0 ? 'opacity-50' : 'opacity-100'}`}
						onClick={handleRedeem}
					>
						{archiveLoading ? 'Fetching Archived Balance...' : redeeming ? 'Processing...' : 'Redeem Archived Balance'}
					</Button>

					{archiveLoading || archivedBalance > 0 ? (
						<Alert title="Info">
							Redeem your archived ICP balance that may have been locked due to failed transactions.
						</Alert>
					) : (
						<Alert title="No Balance">
							You don't have any archived balance to withdraw.
						</Alert>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default RedeemForm;