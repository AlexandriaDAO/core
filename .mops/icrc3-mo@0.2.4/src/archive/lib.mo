import SW "mo:stable-write-only";
import T "../migrations/types";
import ExperimentalCycles "mo:base/ExperimentalCycles";
import Vec "mo:vector";
import D "mo:base/Debug";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";

shared ({ caller = ledger_canister_id }) actor class Archive (_args : T.Current.ArchiveInitArgs) = this {

    let debug_channel = {
      announce = false;
      append = false;
      get = false;
    };

    debug if(debug_channel.announce) D.print("new archive created with the following args" # debug_show(_args));

    type Transaction = T.Current.Transaction;
    type MemoryBlock = {
        offset : Nat64;
        size : Nat;
    };

    public type InitArgs = T.Current.ArchiveInitArgs;

    public type AddTransactionsResponse = T.Current.AddTransactionsResponse;
    public type TransactionRange = T.Current.TransactionRange;

    stable var args = _args;

    stable var memstore = SW.init({
      maxRecords = args.maxRecords;
      indexType = args.indexType;
      maxPages = 62500;
    });

    let sw = SW.StableWriteOnly(?memstore);

    public shared ({ caller }) func append_transactions(txs : [Transaction]) : async AddTransactionsResponse {

      debug if(debug_channel.append) D.print("adding transactions to archive" # debug_show(txs));

      if (caller != ledger_canister_id) {
          return #err("Unauthorized Access: Only the ledger canister can access this archive canister");
      };

      label addrecs for(thisItem in txs.vals()){
        let stats = sw.stats();
        if(stats.itemCount >= args.maxRecords){
          debug if(debug_channel.append)D.print("braking add recs");
          break addrecs;
        };
        ignore sw.write(to_candid(thisItem));
      };

      let final_stats = sw.stats();
      if(final_stats.itemCount >= args.maxRecords){
        return #Full(final_stats);
      };
      #ok(final_stats);
    };

    func total_txs() : Nat {
        sw.stats().itemCount;
    };

    public shared query func total_transactions() : async Nat {
        total_txs();
    };

    public shared query func get_transaction(tx_index : T.Current.TxIndex) : async ?Transaction {
        return _get_transaction(tx_index);
    };

    private func _get_transaction(tx_index : T.Current.TxIndex) : ?Transaction {
        let stats = sw.stats();
        debug if(debug_channel.get) D.print("getting transaction" # debug_show(tx_index, args.firstIndex, stats));
       
        let target_index =  if(tx_index >= args.firstIndex) Nat.sub(tx_index, args.firstIndex) else D.trap("Not on this canister requested " # Nat.toText(tx_index) # "first index: " # Nat.toText(args.firstIndex));
        debug if(debug_channel.get) D.print("target" # debug_show(target_index));
        if(target_index >= stats.itemCount) D.trap("requested an item outside of this archive canister. first index: " # Nat.toText(args.firstIndex) # " last item" # Nat.toText(args.firstIndex + stats.itemCount - 1));
        debug if(debug_channel.get) D.print("target" # debug_show(target_index));
        let t = from_candid(sw.read(target_index)) : ?Transaction;
        return t;
    };

    public shared query func icrc3_get_blocks(req : [T.Current.TransactionRange]) : async T.Current.GetTransactionsResult {

      debug if(debug_channel.get) D.print("request for archive blocks " # debug_show(req));

      let transactions = Vec.new<{id:Nat; block: Transaction}>();
      for(thisArg in req.vals()){
        var tracker = thisArg.start;
        for(thisItem in Iter.range(thisArg.start, thisArg.start + thisArg.length - 1)){
          debug if(debug_channel.get) D.print("getting" # debug_show(thisItem));
          switch(_get_transaction(thisItem)){
            case(null){
              //should be unreachable...do we return an error?
            };
            case(?val){
              debug if(debug_channel.get) D.print("found" # debug_show(val));
              Vec.add(transactions, {id = tracker; block = val});
            };
          };
          tracker += 1;
        };
      };

      { 
          blocks = Vec.toArray(transactions);
          archived_blocks = [];
          log_length =  0;
          certificate = null;
        };
       /*  
       
       Currently this archive canister only supports one level of archive indexes. It does not have the ability to split itself and create a tree structure.
       */
    };

    public shared query func remaining_capacity() : async Nat {
        args.maxRecords - sw.stats().itemCount;
    };

    /// Deposit cycles into this archive canister.
    public shared func deposit_cycles() : async () {
        let amount = ExperimentalCycles.available();
        let accepted = ExperimentalCycles.accept<system>(amount);
        assert (accepted == amount);
    };

    /// Get the remaining cylces on the server
    public query func cycles() : async Nat {
        ExperimentalCycles.balance();
    };

};