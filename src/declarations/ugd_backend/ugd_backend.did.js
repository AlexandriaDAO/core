export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'mc_front' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
