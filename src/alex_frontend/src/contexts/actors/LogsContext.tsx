import { createActorContext } from "ic-use-actor";

import { _SERVICE } from "../../../../declarations/logs/logs.did";

const LogsContext = createActorContext<_SERVICE>();

export default LogsContext;