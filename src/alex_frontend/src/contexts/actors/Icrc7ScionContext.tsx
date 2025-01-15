import { createActorContext } from "ic-use-actor";

import { _SERVICE } from "../../../../declarations/icrc7_scion/icrc7_scion.did";

const Icrc7ScionContext = createActorContext<_SERVICE>();

export default Icrc7ScionContext;
