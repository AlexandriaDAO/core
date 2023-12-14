export const idlFactory = ({ IDL }) => {
  const SourceCard = IDL.Record({
    'title' : IDL.Text,
    'user_query' : IDL.Text,
    'post_id' : IDL.Nat64,
    'content' : IDL.Text,
    'heading' : IDL.Text,
    'author' : IDL.Text,
    'summary' : IDL.Text,
    'bookmarked' : IDL.Bool,
  });
  return IDL.Service({
    'bookmark_sc' : IDL.Func([IDL.Nat64], [], []),
    'delete_sc' : IDL.Func([IDL.Nat64], [], []),
    'get_bookmarks' : IDL.Func([], [IDL.Vec(IDL.Opt(SourceCard))], ['query']),
    'get_sc' : IDL.Func([IDL.Nat64], [IDL.Opt(SourceCard)], ['query']),
    'get_weaviate_query' : IDL.Func(
        [IDL.Text, IDL.Nat8, IDL.Text],
        [IDL.Text],
        [],
      ),
    'whoami' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
