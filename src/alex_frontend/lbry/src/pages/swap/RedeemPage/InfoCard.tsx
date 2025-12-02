import React from 'react';
import { Card, CardContent } from '@/lib/components/card';

const InfoCard: React.FC = () => (
  <Card className="flex-grow">
    <CardContent className="pt-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About Archive Recovery</h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>
              When transactions fail during staking or other operations, your ICP tokens may become archived and temporarily inaccessible.
            </p>
            <p>
              This page allows you to recover those archived funds and return them to your main balance.
            </p>
            <p>
              Common scenarios that lead to archived balances:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Failed staking transactions</li>
              <li>Network interruptions during transfers</li>
              <li>Insufficient transaction fees</li>
              <li>Canister maintenance periods</li>
            </ul>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default InfoCard;