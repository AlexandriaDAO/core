export const idlFactory = ({ IDL }) => {
  const SourceCard = IDL.Record({
    'title' : IDL.Text,
    'user_query' : IDL.Text,
    'post_id' : IDL.Nat64,
    'content' : IDL.Text,
    'heading' : IDL.Text,
    'author' : IDL.Text,
    'bookmarked' : IDL.Bool,
  });
  const MessageCard = IDL.Record({
    'user_query' : IDL.Text,
    'message' : IDL.Text,
  });
  return IDL.Service({
    'bookmark_sc' : IDL.Func([IDL.Nat64], [], []),
    'delete_sc' : IDL.Func([IDL.Nat64], [], []),
    'get_sc' : IDL.Func([IDL.Nat64], [IDL.Opt(SourceCard)], ['query']),
    'get_weaviate_query' : IDL.Func(
        [IDL.Text, IDL.Nat8, IDL.Text],
        [IDL.Text],
        [],
      ),
    'mc_front' : IDL.Func([IDL.Text], [IDL.Opt(MessageCard)], ['query']),
    'save_sc' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
