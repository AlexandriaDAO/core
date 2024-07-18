import MainLayout from '@/layouts/MainLayout';
import React, { useEffect } from 'react';
import { useState } from 'react';

import Swap from '@/features/swap';
const SwapPage = () => {
  return (
    <MainLayout>
      <main>
        <Swap/>
      </main>
    </MainLayout>
  );
}

export default SwapPage;
