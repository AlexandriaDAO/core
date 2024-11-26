import { createActorContext } from "ic-use-actor";

import { _SERVICE } from "../../../../declarations/icrc7/icrc7.did";

const Icrc7Context = createActorContext<_SERVICE>();

export default Icrc7Context;