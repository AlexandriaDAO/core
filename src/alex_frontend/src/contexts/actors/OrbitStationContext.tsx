import { createActorContext } from "ic-use-actor";

import { _SERVICE } from "../../../../declarations/orbit_station/orbit_station.did";

const OrbitStationContext = createActorContext<_SERVICE>();

export default OrbitStationContext;