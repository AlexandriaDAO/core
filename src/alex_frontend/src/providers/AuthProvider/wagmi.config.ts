import { createConfig, http } from "wagmi";

import { mainnet } from "wagmi/chains";
import { walletConnect } from "wagmi/connectors";

// Replace with your own WalletConnect project ID
// Register for free at https://walletconnect.com/
const WALLETCONNECT_PROJECT_ID = "3936b3795b20eea5fe9282a3a80be958";

export const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [walletConnect({ projectId: WALLETCONNECT_PROJECT_ID })],
  transports: {
    [mainnet.id]: http(),
  },
});


export function isChainIdSupported(id?: number) {
  return wagmiConfig.chains.find((c) => c.id === id) !== undefined;
}
