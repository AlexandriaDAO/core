import React from "react";

import SwapPage from "../pages/swap";
import DetailTransaction from "../features/swap/components/transactionHistory/detailTransaction";

export const swapRoutes = [
    { path: "/swap", element: <SwapPage /> },
    { path: "/swap/transaction", element: <DetailTransaction /> },
];