import MigrationTypes "../types";
import v0_1_0 "types";

module {

  let Map =  v0_1_0.Map;
  let Set = v0_1_0.Set;
  let Vec = v0_1_0.Vec;

  type Account = v0_1_0.Account;
  type NFT = v0_1_0.NFT;
  type Value = v0_1_0.Value;

  public func upgrade(prevmigration_state: MigrationTypes.State, args: MigrationTypes.Args, caller: Principal): MigrationTypes.State {

    let owner = switch(args){
      case(?val){
        val.deployer;
      };
      case(_) caller;
    };

    func set_supported_standards(args : MigrationTypes.Args) : v0_1_0.SupportedStandards {
      let icrc7_standard = {
        name = "icrc7";
        url = "https://github.com/dfinity/ICRC/ICRCs/ICRC-7";
      };
      let ?test = args else return [icrc7_standard];
      let ?supported_standards = test.supported_standards else return [icrc7_standard];
      supported_standards;
    };
    
    let ledger_info = switch(args){
      case(?val){
        {val with
          max_update_batch_size = switch(val.max_update_batch_size){
            case(null) v0_1_0.default_max_update_batch_size;
            case(?val) val;
          };
          max_query_batch_size = switch(val.max_query_batch_size){
            case(null) v0_1_0.default_max_query_batch_size;
            case(?val) val;
          };
          default_take_value = switch(val.default_take_value){
            case(null) v0_1_0.default_default_take_value;
            case(?val) val;
          };
          max_take_value = switch(val.max_take_value){
            case(null) v0_1_0.default_max_take_value;
            case(?val) val;
          };
          max_memo_size = switch(val.max_memo_size){
            case(null) v0_1_0.default_max_memo_size;
            case(?val) val;
          };
          permitted_drift = switch(val.permitted_drift){
            case(null) v0_1_0.default_permitted_drift;
            case(?val) val;
          };
          tx_window = switch(val.tx_window){
            case(null) v0_1_0.default_tx_window;
            case(?val) val;
          };
          allow_transfers = switch(val.allow_transfers){
            case(null) v0_1_0.default_allow_transfers;
            case(?val) val;
          };
          burn_account = switch(val.burn_account){
            case(null) null;
            case(?val) ?val;
          };
        };
      };
      case(_) {
        {
          symbol = null;
          name = null;
          description = null;
          logo = null;
          supply_cap = null;
          total_supply = 0;
          max_query_batch_size = v0_1_0.default_max_query_batch_size;
          max_update_batch_size = v0_1_0.default_max_update_batch_size;
          default_take_value = v0_1_0.default_default_take_value;
          max_take_value = v0_1_0.default_max_take_value;
          max_memo_size = v0_1_0.default_max_take_value;
          tx_window = v0_1_0.default_tx_window;
          permitted_drift = v0_1_0.default_permitted_drift;
          allow_transfers = v0_1_0.default_allow_transfers;
          burn_account = null;
          deployer = owner;
        };
      };
    };

    let state = {
      ledger_info : MigrationTypes.Current.LedgerInfo = {
        var symbol = ledger_info.symbol;
        var name = ledger_info.name;
        var description = ledger_info.description;
        var logo = ledger_info.logo;
        var supply_cap = ledger_info.supply_cap;
        var total_supply = 0;
        var max_query_batch_size = ledger_info.max_query_batch_size;
        var max_update_batch_size = ledger_info.max_update_batch_size;
        var default_take_value = ledger_info.default_take_value;
        var max_take_value = ledger_info.max_take_value;
        var max_memo_size = ledger_info.max_memo_size;
        var permitted_drift = ledger_info.permitted_drift;
        var tx_window = ledger_info.tx_window;
        var allow_transfers = ledger_info.allow_transfers;
        var burn_account = ledger_info.burn_account
      };

      var owner = owner;
      nfts :  Map.Map<Nat, NFT> = Map.new<Nat, NFT>();
      owners : Map.Map<Account, Nat> = Map.new<Account, Nat>();
      ledger : Vec.Vector<Value> = Vec.new();
      indexes = {
        nft_to_owner : Map.Map<Nat, Account> = Map.new<Nat, Account>();
        owner_to_nfts : Map.Map<Account, Set.Set<Nat>> = Map.new<Account, Set.Set<Nat>>();
        recent_transactions: Map.Map<Blob, (Int, Nat)> = Map.new<Blob, (Int, Nat)>();
      };
      var supported_standards = set_supported_standards(args);
    };

    return #v0_1_0(#data(state));
  };

  public func downgrade(prev_migration_state: MigrationTypes.State, args: MigrationTypes.Args, caller: Principal): MigrationTypes.State {

    return #v0_0_0(#data);
  };

};