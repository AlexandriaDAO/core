import v0_1_0 "./v000_001_000/types";
import Int "mo:base/Int";


module {
  // do not forget to change current migration when you add a new one
  // you should use this field to import types from you current migration anywhere in your project
  // instead of importing it from migration folder itself
  public let Current = v0_1_0;

  public type Args = ?{
    deployer: Principal;
    symbol  : ?Text;
    name    : ?Text;
    description : ?Text;
    logo : ?Text;
    supply_cap: ?Nat;
    max_query_batch_size : ?Nat;
    max_update_batch_size : ?Nat;
    default_take_value : ?Nat;
    max_take_value: ?Nat;
    max_memo_size : ?Nat;
    allow_transfers: ?Bool;
    permitted_drift : ?Nat;
    tx_window : ?Nat;
    burn_account : ?v0_1_0.Account;
    supported_standards : ?v0_1_0.SupportedStandards;
  };

  public type State = {
    #v0_0_0: {#id; #data};
    #v0_1_0: {#id; #data:  v0_1_0.State};
    // do not forget to add your new migration state types here
  };
};