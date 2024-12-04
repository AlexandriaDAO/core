import { createActorContext } from "ic-use-actor";

import { _SERVICE } from "../../../../declarations/emporium/emporium.did";

const EmporiumContext = createActorContext<_SERVICE>();

export default EmporiumContext;