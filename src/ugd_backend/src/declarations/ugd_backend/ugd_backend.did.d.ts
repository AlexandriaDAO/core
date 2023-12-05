import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface MessageCard { 'user_query' : string, 'message' : string }
export interface SourceCard {
  'title' : string,
  'user_query' : string,
  'post_id' : bigint,
  'content' : string,
  'heading' : string,
  'author' : string,
  'bookmarked' : boolean,
}
export interface _SERVICE {
  'bookmark_sc' : ActorMethod<[bigint], undefined>,
  'delete_sc' : ActorMethod<[bigint], undefined>,
  'get_sc' : ActorMethod<[bigint], [] | [SourceCard]>,
  'get_weaviate_query' : ActorMethod<[string, number, string], string>,
  'mc_front' : ActorMethod<[string], [] | [MessageCard]>,
  'save_sc' : ActorMethod<[string, string, string, string, string], undefined>,
}
