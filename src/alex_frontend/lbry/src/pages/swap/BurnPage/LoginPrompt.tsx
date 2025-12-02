import React from 'react';
import { Card, CardContent } from '@/lib/components/card';

const LoginPrompt: React.FC = () => (
	<Card className="flex-grow flex justify-center items-center">
		<CardContent className="flex flex-col items-center justify-center p-6 text-center">
			<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Login to Burn</h3>
			<p className="text-gray-600 dark:text-gray-400 mb-6">Connect your wallet to burn LBRY tokens and earn ICP + ALEX rewards</p>
		</CardContent>
	</Card>
);

export default LoginPrompt;