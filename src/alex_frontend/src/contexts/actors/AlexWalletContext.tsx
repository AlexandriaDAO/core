import { createActorContext } from "ic-use-actor";

import { _SERVICE } from "../../../../declarations/alex_wallet/alex_wallet.did";

const AlexWalletContext = createActorContext<_SERVICE>();

export default AlexWalletContext;