import { createUseActorHook } from 'ic-use-actor';
import { _SERVICE } from "../../../../declarations/orbit_station/orbit_station.did";
import { OrbitStationContext } from '@/contexts/actors';

const useOrbitStation = createUseActorHook<_SERVICE>(OrbitStationContext);

export default useOrbitStation