import MigrationTypes "../types";
import v0_1_0 "types";

import D "mo:base/Debug";

import Vec "mo:vector";
import Map "mo:map9/Map";

module {

  type Transaction = v0_1_0.Transaction;

  public func upgrade(prevmigration_state: MigrationTypes.State, args: MigrationTypes.Args, caller: Principal): MigrationTypes.State {

    

    let state : MigrationTypes.Current.State = {
      var lastIndex = 0;
      var firstIndex = 0;
      var ledger : Vec.Vector<Transaction> = Vec.new<Transaction>();
      var bCleaning = false;
      var cleaningTimer = null;
      var latest_hash = null;
      supportedBlocks =  Vec.new<v0_1_0.BlockType>();
      archives = Map.new<Principal, v0_1_0.TransactionRange>();
      ledgerCanister = caller;
      constants = {
        archiveProperties = switch(args){
          case(null){
            {
              var maxActiveRecords = 2000;
              var settleToRecords = 1000;
              var maxRecordsInArchiveInstance = 10_000_000;
              var maxArchivePages  = 62500;
              var archiveIndexType = #Stable;
              var maxRecordsToArchive = 10_000;
              var archiveCycles = 2_000_000_000_000; //two trillion
              var archiveControllers = null;
            };
          };
          case(?val){
            {
              var maxActiveRecords = val.maxActiveRecords;
              var settleToRecords = val.settleToRecords;
              var maxRecordsInArchiveInstance = val.maxRecordsInArchiveInstance;
              var maxArchivePages  = val.maxArchivePages;
              var archiveIndexType = val.archiveIndexType;
              var maxRecordsToArchive = val.maxRecordsToArchive;
              var archiveCycles = val.archiveCycles;
              var archiveControllers = val.archiveControllers;
            };
          };
        };
      };
    };
    return #v0_1_0(#data(state));
  };

  public func downgrade(prev_migration_state: MigrationTypes.State, args: MigrationTypes.Args, caller: Principal): MigrationTypes.State {

    return #v0_0_0(#data);
  };

};