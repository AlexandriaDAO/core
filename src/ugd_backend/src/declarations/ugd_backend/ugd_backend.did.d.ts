import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface SourceCard {
  'title' : string,
  'user_query' : string,
  'post_id' : bigint,
  'content' : string,
  'heading' : string,
  'author' : string,
  'summary' : string,
  'bookmarked' : boolean,
}
export interface _SERVICE {
  'bookmark_sc' : ActorMethod<[bigint], undefined>,
  'delete_sc' : ActorMethod<[bigint], undefined>,
  'get_bookmarks' : ActorMethod<[], Array<[] | [SourceCard]>>,
  'get_sc' : ActorMethod<[bigint], [] | [SourceCard]>,
  'get_weaviate_query' : ActorMethod<[string, number, string], string>,
  'whoami' : ActorMethod<[string], string>,
}
