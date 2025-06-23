import React from 'react';
import { Skeleton } from '@/lib/components/skeleton';
import { Card, CardContent } from '@/lib/components/card';

const ExchangePageSkeleton: React.FC = () => (
	<Card className="flex-grow flex justify-center items-center">
		<CardContent className="flex flex-col items-center justify-center gap-4 p-8">
			<Skeleton className="w-16 h-16 rounded-lg" />
			<div className="space-y-2 text-center">
				<Skeleton className="h-6 w-32" />
				<Skeleton className="h-4 w-48" />
			</div>
		</CardContent>
	</Card>
);

export default ExchangePageSkeleton;