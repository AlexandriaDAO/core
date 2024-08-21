import MigrationTypes "../types";
import v0_1_0 "types";

import Map "mo:map9/Map";
import Set "mo:map9/Set";
import Vec "mo:vector";

module {
  public func upgrade(prevmigration_state: MigrationTypes.State, args: MigrationTypes.Args, caller: Principal): MigrationTypes.State {

    let ledger_info = switch(args){
      case(?val){
        {
          max_approvals_per_token_or_collection = switch(val.max_approvals_per_token_or_collection){
            case(?val) val;
            case(null) v0_1_0.default_max_approvals_per_token_or_collection;
          };
          max_revoke_approvals = switch(val.max_revoke_approvals){
            case(?val) val;
            case(null) v0_1_0.default_max_revoke_approvals;
          };
          max_approvals = switch(val.max_approvals){
            case(?val) val;
            case(null) v0_1_0.default_max_approvals;
          };
          settle_to_approvals = switch(val.settle_to_approvals){
            case(?val) val;
            case(null) v0_1_0.default_settle_to_approvals;
          };
          collection_approval_requires_token = switch(val.collection_approval_requires_token){
            case(?val) val;
            case(null) v0_1_0.default_collection_approval_requires_token;
          };
        };
      };
      case(_) {
        {
          max_approvals_per_token_or_collection = v0_1_0.default_max_approvals_per_token_or_collection;
          max_revoke_approvals = v0_1_0.default_max_revoke_approvals;
          max_approvals = v0_1_0.default_max_approvals;
          settle_to_approvals = v0_1_0.default_settle_to_approvals;
          collection_approval_requires_token = v0_1_0.default_collection_approval_requires_token;
        };
      };
    };

    let state = {
      ledger_info : MigrationTypes.Current.LedgerInfo = {
        var max_approvals_per_token_or_collection = ledger_info.max_approvals_per_token_or_collection;
        var max_revoke_approvals = ledger_info.max_revoke_approvals;

        var max_approvals = ledger_info.max_approvals;
        var settle_to_approvals = ledger_info.settle_to_approvals;
        var collection_approval_requires_token = ledger_info.collection_approval_requires_token;
      };
      
      token_approvals : Map.Map<(?Nat, v0_1_0.Account), v0_1_0.ApprovalInfo> = Map.new<(?Nat, v0_1_0.Account), v0_1_0.ApprovalInfo>();
      indexes = {
        token_to_approval_account : Map.Map<?Nat, Set.Set<v0_1_0.Account>> = Map.new<?Nat, Set.Set<v0_1_0.Account>>();
        owner_to_approval_account : Map.Map<v0_1_0.Account, Set.Set<(?Nat, v0_1_0.Account)>> = Map.new<v0_1_0.Account, Set.Set<(?Nat, v0_1_0.Account)>>();
      };
    };

    return #v0_1_0(#data(state));
  };

  public func downgrade(prev_migration_state: MigrationTypes.State, args: MigrationTypes.Args, caller: Principal): MigrationTypes.State {
    return #v0_0_0(#data);
  };

};