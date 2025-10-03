import React, { useCallback, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { Alert } from '@/components/Alert';
import { resetError } from '../../features/stake/stakeSlice';
import StakeForm from '@/features/stake/components/StakeForm';
import CommunityStakes from '@/features/stake/components/CommunityStakes';
import MyStakes from '@/features/stake/components/MyStakes';
import { X } from 'lucide-react';
import { Button } from '@/lib/components/button';

const StakePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {user} = useAppSelector(state=>state.auth);
  const { stakingError, unstakingError, claimingError } = useAppSelector((state) => state.stake);

  const error = stakingError || unstakingError || claimingError;

  const handleDismissError = useCallback(() => {
    dispatch(resetError());
  }, [dispatch]);

  return (
    <div className="px-4 py-8">
      <div className="max-w-7xl mx-auto">

        {/* Error Alert */}
        {error && (
          <div className="relative mb-6">
            <Alert variant="danger" title="Error">
              {error}
            </Alert>
            <Button
              variant='muted'
              scale='icon'
              rounded="full"
              onClick={handleDismissError}
              className="absolute top-2 right-2"
            >
              <X size={16}/>
            </Button>
          </div>
        )}

        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <StakeForm />
            <CommunityStakes />
          </div>

          {user && <MyStakes />}
      </div>
      </div>
    </div>
  );
}

export default StakePage;