export const idlFactory = ({ IDL }) => {
  const MessageCard = IDL.Record({
    'user_query' : IDL.Text,
    'message' : IDL.Text,
  });
  return IDL.Service({
    'mc_front' : IDL.Func([IDL.Text], [IDL.Opt(MessageCard)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
