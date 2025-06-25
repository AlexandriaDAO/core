import React from 'react';
import { RotateCw } from 'lucide-react';
import { Card, CardContent } from '@/lib/components/card';

const LoadingView: React.FC = () => (
  <Card className="flex-grow flex justify-center items-center">
    <CardContent className="flex flex-col items-center justify-center gap-2 p-6">
      <RotateCw size={32} className="animate-spin" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction in Progress</h3>
      <p className="text-gray-600 dark:text-gray-400 text-center">
        Processing your redeem transaction...
      </p>
    </CardContent>
  </Card>
);

export default LoadingView;