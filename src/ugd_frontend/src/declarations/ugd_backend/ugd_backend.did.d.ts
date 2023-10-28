import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface MessageCard { 'user_query' : string, 'message' : string }
export interface _SERVICE {
  'mc_front' : ActorMethod<[string], [] | [MessageCard]>,
}
