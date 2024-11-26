import { createActorContext } from "ic-use-actor";

import { _SERVICE } from "../../../../declarations/vetkd/vetkd.did";

const VetkdContext = createActorContext<_SERVICE>();

export default VetkdContext;