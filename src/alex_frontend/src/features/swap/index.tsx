import React, { lazy, Suspense } from 'react';

const SwapMain = lazy(() => import("./swapMain"));

const Swap = () => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<SwapMain/>
		</Suspense>
	);
}

export default Swap;
