import v0_1_0 "./v000_001_000/types";
import Int "mo:base/Int";


module {
  // do not forget to change current migration when you add a new one
  // you should use this field to import types from you current migration anywhere in your project
  // instead of importing it from migration folder itself
  public let Current = v0_1_0;

  public type Args = ?{
    deployer: Principal;
    max_approvals_per_token_or_collection : ?Nat;
    max_revoke_approvals : ?Nat;
    max_approvals : ?Nat;
    settle_to_approvals : ?Nat;
    collection_approval_requires_token : ?Bool;
  };

  public type State = {
    #v0_0_0: {#id; #data};
    #v0_1_0: {#id; #data:  v0_1_0.State};
    // do not forget to add your new migration state types here
  };
};