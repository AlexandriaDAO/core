export const idlFactory = ({ IDL }) => {
  const UsernameAvailabilityResponse = IDL.Record({
    'username' : IDL.Text,
    'available' : IDL.Bool,
    'message' : IDL.Text,
  });
  const Result = IDL.Variant({
    'Ok' : UsernameAvailabilityResponse,
    'Err' : IDL.Text,
  });
  const CreateEngineRequest = IDL.Record({
    'key' : IDL.Text,
    'title' : IDL.Text,
    'active' : IDL.Bool,
    'host' : IDL.Text,
    'index' : IDL.Text,
  });
  const Engine = IDL.Record({
    'id' : IDL.Nat64,
    'key' : IDL.Text,
    'title' : IDL.Text,
    'updated_at' : IDL.Nat64,
    'active' : IDL.Bool,
    'owner' : IDL.Principal,
    'host' : IDL.Text,
    'created_at' : IDL.Nat64,
    'index' : IDL.Text,
  });
  const Result_1 = IDL.Variant({ 'Ok' : Engine, 'Err' : IDL.Text });
  const CreateNodeRequest = IDL.Record({ 'key' : IDL.Text });
  const Node = IDL.Record({
    'id' : IDL.Nat64,
    'key' : IDL.Text,
    'updated_at' : IDL.Nat64,
    'active' : IDL.Bool,
    'owner' : IDL.Principal,
    'created_at' : IDL.Nat64,
  });
  const Result_2 = IDL.Variant({ 'Ok' : Node, 'Err' : IDL.Text });
  const Result_3 = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  const User = IDL.Record({
    'updated_at' : IDL.Nat64,
    'principal' : IDL.Principal,
    'librarian' : IDL.Bool,
    'username' : IDL.Text,
    'name' : IDL.Text,
    'created_at' : IDL.Nat64,
    'avatar' : IDL.Text,
  });
  const Result_4 = IDL.Variant({ 'Ok' : User, 'Err' : IDL.Text });
  const Result_5 = IDL.Variant({ 'Ok' : IDL.Vec(Engine), 'Err' : IDL.Text });
  const Result_6 = IDL.Variant({ 'Ok' : IDL.Vec(Node), 'Err' : IDL.Text });
  const SignupRequest = IDL.Record({ 'username' : IDL.Text });
  const UpdateEngineStatusRequest = IDL.Record({
    'id' : IDL.Nat64,
    'active' : IDL.Bool,
  });
  const UpdateNodeStatusRequest = IDL.Record({
    'id' : IDL.Nat64,
    'active' : IDL.Bool,
  });
  const UpdateUserRequest = IDL.Record({
    'name' : IDL.Opt(IDL.Text),
    'avatar' : IDL.Opt(IDL.Text),
  });
  return IDL.Service({
    'check_username_availability' : IDL.Func([IDL.Text], [Result], ['query']),
    'create_engine' : IDL.Func([CreateEngineRequest], [Result_1], []),
    'create_node' : IDL.Func([CreateNodeRequest], [Result_2], []),
    'delete_engine' : IDL.Func([IDL.Nat64], [Result_3], []),
    'delete_node' : IDL.Func([IDL.Nat64], [Result_3], []),
    'get_active_engines' : IDL.Func(
        [IDL.Opt(IDL.Principal)],
        [IDL.Vec(Engine)],
        ['query'],
      ),
    'get_active_nodes' : IDL.Func(
        [IDL.Opt(IDL.Principal)],
        [IDL.Vec(Node)],
        ['query'],
      ),
    'get_current_user' : IDL.Func([], [Result_4], ['query']),
    'get_engines' : IDL.Func([IDL.Vec(IDL.Nat64)], [Result_5], ['query']),
    'get_engines_strict' : IDL.Func(
        [IDL.Vec(IDL.Nat64)],
        [Result_5],
        ['query'],
      ),
    'get_my_active_engines' : IDL.Func([], [IDL.Vec(Engine)], ['query']),
    'get_my_active_nodes' : IDL.Func([], [IDL.Vec(Node)], ['query']),
    'get_my_engines' : IDL.Func([], [IDL.Vec(Engine)], ['query']),
    'get_my_nodes' : IDL.Func([], [IDL.Vec(Node)], ['query']),
    'get_nodes' : IDL.Func([IDL.Vec(IDL.Nat64)], [Result_6], ['query']),
    'get_nodes_strict' : IDL.Func([IDL.Vec(IDL.Nat64)], [Result_6], ['query']),
    'get_user' : IDL.Func([IDL.Principal], [Result_4], ['query']),
    'get_user_engines' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Engine)],
        ['query'],
      ),
    'get_user_nodes' : IDL.Func([IDL.Principal], [IDL.Vec(Node)], ['query']),
    'signup' : IDL.Func([SignupRequest], [Result_4], []),
    'update_engine_status' : IDL.Func(
        [UpdateEngineStatusRequest],
        [Result_1],
        [],
      ),
    'update_node_status' : IDL.Func([UpdateNodeStatusRequest], [Result_2], []),
    'update_profile' : IDL.Func([UpdateUserRequest], [Result_4], []),
    'upgrade_to_librarian' : IDL.Func([], [Result_4], []),
    'whoami' : IDL.Func([], [IDL.Principal], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
