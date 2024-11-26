import { createActorContext } from "ic-use-actor";

import { _SERVICE } from "../../../../declarations/user/user.did";

const UserContext = createActorContext<_SERVICE>();

export default UserContext;