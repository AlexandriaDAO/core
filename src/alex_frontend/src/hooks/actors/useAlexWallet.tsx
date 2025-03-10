import { createUseActorHook } from 'ic-use-actor';
import { _SERVICE } from "../../../../declarations/alex_wallet/alex_wallet.did";
import { AlexWalletContext } from '@/contexts/actors';

const useAlexWallet = createUseActorHook<_SERVICE>(AlexWalletContext);

export default useAlexWallet;