



// please do not import any types from your project outside migrations folder here
// it can lead to bugs when you change those types later, because migration types should not be changed
// you should also avoid importing these types anywhere in your project directly from here
// use MigrationTypes.Current property instead

import Region "mo:base/Region";
import Array "mo:base/Array";
import Vec "mo:vector";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import D "mo:base/Debug";
import SW "mo:stable-write-only";
import Map "mo:map9/Map";

module {

  //public let CandyTypes = CandyTypesLib;

  public type Value = { 
    #Blob : Blob; 
    #Text : Text; 
    #Nat : Nat;
    #Int : Int;
    #Array : [Value]; 
    #Map : [(Text, Value)]; 
  };

  public type TxIndex = Nat;

  public type Transaction = Value;

  public type State = {
    var ledger : Vec.Vector<Transaction>;
    archives: Map.Map<Principal, TransactionRange>;
    supportedBlocks: Vec.Vector<BlockType>;
    ledgerCanister : Principal;
    var lastIndex : Nat;
    var firstIndex : Nat;
    var bCleaning : Bool;
    var cleaningTimer : ?Nat;
    var latest_hash : ?Blob;
    constants : {
      archiveProperties: {
        var maxActiveRecords : Nat;
        var settleToRecords : Nat;
        var maxRecordsInArchiveInstance : Nat;
        var maxRecordsToArchive : Nat;
        var maxArchivePages : Nat;
        var archiveIndexType : SW.IndexType;
        var archiveCycles : Nat;
        var archiveControllers : ??[Principal];
      };
    };
  };

  public type Stats = {
    localLedgerSize : Nat;
    lastIndex: Nat;
    firstIndex: Nat;
    archives: [(Principal, TransactionRange)];
    supportedBlocks: [BlockType];
    ledgerCanister : Principal;
    bCleaning : Bool;
   
    constants : {
      archiveProperties: {
        maxActiveRecords : Nat;
        settleToRecords : Nat;
        maxRecordsInArchiveInstance : Nat;
        maxRecordsToArchive : Nat;
        archiveCycles : Nat;
        archiveControllers : ??[Principal];
      };
    };
  };

  public type AddTransactionsResponse = {
      #Full : SW.Stats;
      #ok : SW.Stats;
      #err: Text;
    };

  /// The type to request a range of transactions from the ledger canister
  public type TransactionRange = {
      start : Nat;
      length : Nat;
  };

  public type GetBlocksArgs = [TransactionRange];

  public type ArchivedTransactionResponse = {
        args : [TransactionRange];
        callback : GetTransactionsFn;
    };

  public type GetArchivesArgs =  {
    // The last archive seen by the client.
    // The Ledger will return archives coming
    // after this one if set, otherwise it
    // will return the first archives.
      from : ?Principal;
  };
  public type GetArchivesResult = [GetArchivesResultItem];

  public type GetArchivesResultItem = {
    // The id of the archive
    canister_id : Principal;

    // The first block in the archive
    start : Nat;

    // The last block in the archive
    end : Nat;
  };

  public type DataCertificate = {

    // Signature of the root of the hash_tree
    certificate : Blob;

    // CBOR encoded hash_tree
    hash_tree : Blob;
  };

  public type Tip = {

    // Signature of the root of the hash_tree
    last_block_index : Blob;
    last_block_hash : Blob;

    // CBOR encoded hash_tree
    hash_tree : Blob;
  };

  public type GetTransactionsResult = {
    // Total number of transactions in the
    // transaction log
    log_length : Nat;
    
    blocks : [{ id : Nat; block : Value }];

    archived_blocks : [ArchivedTransactionResponse];
  };

  public type GetBlocksResult = GetTransactionsResult;


  public type GetTransactionsFn = shared query ([TransactionRange]) -> async GetTransactionsResult;

  public type BlockType = {
    block_type : Text;
    url : Text;
  };

  public type ICRC3Interface = actor {
    icrc3_get_blocks : GetTransactionsFn;
    icrc3_get_archives : query (GetArchivesArgs) -> async (GetArchivesResult) ;
    icrc3_get_tip_certificate : query () -> async (?DataCertificate);
    icrc3_supported_block_types: query () -> async [BlockType];
  };

  /// The Interface for the Archive canister
    public type ArchiveInterface = actor {
      /// Appends the given transactions to the archive.
      /// > Only the Ledger canister is allowed to call this method
      append_transactions : shared ([Transaction]) -> async AddTransactionsResponse;

      /// Returns the total number of transactions stored in the archive
      total_transactions : shared query () -> async Nat;

      /// Returns the transaction at the given index
      get_transaction : shared query (Nat) -> async ?Transaction;

      /// Returns the transactions in the given range
      icrc3_get_blocks : shared query (TransactionRange) -> async TransactionsResult;

      /// Returns the number of bytes left in the archive before it is full
      /// > The capacity of the archive canister is 32GB
      remaining_capacity : shared query () -> async Nat;
    };

    public type canister_settings = {
        controllers : ?[Principal];
        freezing_threshold : ?Nat;
        memory_allocation : ?Nat;
        compute_allocation : ?Nat;
    };

    public type IC = actor {
        update_settings : shared {
            canister_id : Principal;
            settings : canister_settings;
        } -> async ();
    };

    public type ArchiveInitArgs = {
      maxRecords : Nat;
      maxPages : Nat;
      indexType : SW.IndexType;
      firstIndex : Nat;
    };

    public type TransactionsResult = {
      blocks: [Transaction];
    };

    public type InitArgs = {
      maxActiveRecords : Nat;
      settleToRecords : Nat;
      maxRecordsInArchiveInstance : Nat;
      maxArchivePages : Nat;
      archiveIndexType : SW.IndexType;
      maxRecordsToArchive : Nat;
      archiveCycles : Nat;
      archiveControllers : ??[Principal];
      supportedBlocks : [BlockType];
    };

};