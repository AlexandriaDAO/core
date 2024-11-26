import { createActorContext } from "ic-use-actor";

import { _SERVICE } from "../../../../declarations/ALEX/ALEX.did";

const AlexContext = createActorContext<_SERVICE>();

export default AlexContext;