import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface CreateEngineRequest {
  'key' : string,
  'title' : string,
  'active' : boolean,
  'host' : string,
  'index' : string,
}
export interface CreateNodeRequest { 'key' : string }
export interface Engine {
  'id' : bigint,
  'key' : string,
  'title' : string,
  'updated_at' : bigint,
  'active' : boolean,
  'owner' : Principal,
  'host' : string,
  'created_at' : bigint,
  'index' : string,
}
export interface Node {
  'id' : bigint,
  'key' : string,
  'updated_at' : bigint,
  'active' : boolean,
  'owner' : Principal,
  'created_at' : bigint,
}
export type Result = { 'Ok' : UsernameAvailabilityResponse } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : Engine } |
  { 'Err' : string };
export type Result_2 = { 'Ok' : Node } |
  { 'Err' : string };
export type Result_3 = { 'Ok' : null } |
  { 'Err' : string };
export type Result_4 = { 'Ok' : User } |
  { 'Err' : string };
export type Result_5 = { 'Ok' : Array<Engine> } |
  { 'Err' : string };
export type Result_6 = { 'Ok' : Array<Node> } |
  { 'Err' : string };
export interface SignupRequest { 'username' : string }
export interface UpdateEngineStatusRequest { 'id' : bigint, 'active' : boolean }
export interface UpdateNodeStatusRequest { 'id' : bigint, 'active' : boolean }
export interface UpdateUserRequest {
  'name' : [] | [string],
  'avatar' : [] | [string],
}
export interface User {
  'updated_at' : bigint,
  'principal' : Principal,
  'librarian' : boolean,
  'username' : string,
  'name' : string,
  'created_at' : bigint,
  'avatar' : string,
}
export interface UsernameAvailabilityResponse {
  'username' : string,
  'available' : boolean,
  'message' : string,
}
export interface _SERVICE {
  'check_username_availability' : ActorMethod<[string], Result>,
  'create_engine' : ActorMethod<[CreateEngineRequest], Result_1>,
  'create_node' : ActorMethod<[CreateNodeRequest], Result_2>,
  'delete_engine' : ActorMethod<[bigint], Result_3>,
  'delete_node' : ActorMethod<[bigint], Result_3>,
  'get_active_engines' : ActorMethod<[[] | [Principal]], Array<Engine>>,
  'get_active_nodes' : ActorMethod<[[] | [Principal]], Array<Node>>,
  'get_current_user' : ActorMethod<[], Result_4>,
  'get_engines' : ActorMethod<[BigUint64Array | bigint[]], Result_5>,
  'get_engines_strict' : ActorMethod<[BigUint64Array | bigint[]], Result_5>,
  'get_my_active_engines' : ActorMethod<[], Array<Engine>>,
  'get_my_active_nodes' : ActorMethod<[], Array<Node>>,
  'get_my_engines' : ActorMethod<[], Array<Engine>>,
  'get_my_nodes' : ActorMethod<[], Array<Node>>,
  'get_nodes' : ActorMethod<[BigUint64Array | bigint[]], Result_6>,
  'get_nodes_strict' : ActorMethod<[BigUint64Array | bigint[]], Result_6>,
  'get_user' : ActorMethod<[Principal], Result_4>,
  'get_user_engines' : ActorMethod<[Principal], Array<Engine>>,
  'get_user_nodes' : ActorMethod<[Principal], Array<Node>>,
  'signup' : ActorMethod<[SignupRequest], Result_4>,
  'update_engine_status' : ActorMethod<[UpdateEngineStatusRequest], Result_1>,
  'update_node_status' : ActorMethod<[UpdateNodeStatusRequest], Result_2>,
  'update_profile' : ActorMethod<[UpdateUserRequest], Result_4>,
  'upgrade_to_librarian' : ActorMethod<[], Result_4>,
  'whoami' : ActorMethod<[], Principal>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
