// import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Vec "mo:vector";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import D "mo:base/Debug";
import CertifiedData "mo:base/CertifiedData";

import CertTree "mo:cert/CertTree";

import ICRC7 "mo:icrc7-mo";
import ICRC3 "mo:icrc3-mo";
import ICRC37 "mo:icrc37-mo";

import ICRC7Default "./initial_state/icrc7";
import ICRC3Default "./initial_state/icrc3";
import ICRC37Default "./initial_state/icrc37";
import NFTArchive "./nft_archive";

shared (_init_msg) actor class Example(
  _args : {
    icrc7_args : ?ICRC7.InitArgs;
    icrc3_args : ICRC3.InitArgs;
    icrc37_args : ?ICRC37.InitArgs;
  }
) = this {

  type Account = ICRC7.Account;
  type Environment = ICRC7.Environment;
  type Value = ICRC7.Value;
  type NFT = ICRC7.NFT;
  type NFTShared = ICRC7.NFTShared;
  type NFTMap = ICRC7.NFTMap;
  type OwnerOfResponse = ICRC7.Service.OwnerOfResponse;
  type OwnerOfRequest = ICRC7.Service.OwnerOfRequest;
  type TransferArgs = ICRC7.Service.TransferArg;
  type TransferResult = ICRC7.Service.TransferResult;
  type TransferError = ICRC7.Service.TransferError;
  type BalanceOfRequest = ICRC7.Service.BalanceOfRequest;
  type BalanceOfResponse = ICRC7.Service.BalanceOfResponse;
  type ApproveCollectionArg = ICRC37.Service.ApproveCollectionArg;

  type TransferFromArg = ICRC37.Service.TransferFromArg;
  type TransferFromResult = ICRC37.Service.TransferFromResult;

  stable var init_msg = _init_msg; //preserves original initialization;

  stable var icrc7_migration_state = ICRC7.init(
    ICRC7.initialState(),
    #v0_1_0(#id),
    switch (_args.icrc7_args) {
      case (null) ICRC7Default.defaultConfig(init_msg.caller);
      case (?val) val;
    },
    init_msg.caller,
  );

  let #v0_1_0(#data(icrc7_state_current)) = icrc7_migration_state;

  stable var icrc3_migration_state = ICRC3.init(
    ICRC3.initialState(),
    #v0_1_0(#id),
    switch (_args.icrc3_args) {
      case (null) ICRC3Default.defaultConfig(init_msg.caller);
      case (?val) ?val : ICRC3.InitArgs;
    },
    init_msg.caller,
  );

  let #v0_1_0(#data(icrc3_state_current)) = icrc3_migration_state;

  stable var icrc37_migration_state = ICRC37.init(
    ICRC37.initialState(),
    #v0_1_0(#id),
    switch (_args.icrc37_args) {
      case (null) ICRC37Default.defaultConfig(init_msg.caller);
      case (?val) val;
    },
    init_msg.caller,
  );

  let #v0_1_0(#data(icrc37_state_current)) = icrc37_migration_state;

  private var _icrc7 : ?ICRC7.ICRC7 = null;
  private var _icrc3 : ?ICRC3.ICRC3 = null;
  private var _icrc37 : ?ICRC37.ICRC37 = null;

  private func get_icrc7_state() : ICRC7.CurrentState {
    return icrc7_state_current;
  };

  //changed from private to public
  private func get_icrc3_state() : ICRC3.CurrentState {
    return icrc3_state_current;
  };

  private func get_icrc37_state() : ICRC37.CurrentState {
    return icrc37_state_current;
  };

  stable let cert_store : CertTree.Store = CertTree.newStore();
  let ct = CertTree.Ops(cert_store);

  private func get_certificate_store() : CertTree.Store {
    D.print("returning cert store " # debug_show (cert_store));
    return cert_store;
  };

  private func updated_certification(cert : Blob, lastIndex : Nat) : Bool {

    D.print("updating the certification " # debug_show (CertifiedData.getCertificate(), ct.treeHash()));
    ct.setCertifiedData();
    D.print("did the certification " # debug_show (CertifiedData.getCertificate()));
    return true;
  };

  private func get_icrc3_environment() : ICRC3.Environment {
    ?{
      updated_certification = ?updated_certification;
      get_certificate_store = ?get_certificate_store;
    };
  };

  D.print("Initargs: " # debug_show (_args));

  func ensure_block_types(icrc3Class : ICRC3.ICRC3) : () {
    D.print("in ensure_block_types: ");
    let supportedBlocks = Buffer.fromIter<ICRC3.BlockType>(icrc3Class.supported_block_types().vals());

    let blockequal = func(a : { block_type : Text }, b : { block_type : Text }) : Bool {
      a.block_type == b.block_type;
    };

    for (thisItem in icrc7().supported_blocktypes().vals()) {
      if (Buffer.indexOf<ICRC3.BlockType>({ block_type = thisItem.0; url = thisItem.1 }, supportedBlocks, blockequal) == null) {
        supportedBlocks.add({ block_type = thisItem.0; url = thisItem.1 });
      };

    };

    for (thisItem in icrc37().supported_blocktypes().vals()) {
      if (Buffer.indexOf<ICRC3.BlockType>({ block_type = thisItem.0; url = thisItem.1 }, supportedBlocks, blockequal) == null) {
        supportedBlocks.add({ block_type = thisItem.0; url = thisItem.1 });
      };
    };

    icrc3Class.update_supported_blocks(Buffer.toArray(supportedBlocks));
  };

  func icrc3() : ICRC3.ICRC3 {
    switch (_icrc3) {
      case (null) {
        let initclass : ICRC3.ICRC3 = ICRC3.ICRC3(?icrc3_migration_state, Principal.fromActor(this), get_icrc3_environment());

        D.print("ensure should be done: " # debug_show (initclass.supported_block_types()));
        _icrc3 := ?initclass;
        ensure_block_types(initclass);

        initclass;
      };
      case (?val) val;
    };
  };

  private func get_icrc7_environment() : ICRC7.Environment {
    {
      canister = get_canister;
      get_time = get_time;
      refresh_state = get_icrc7_state;
      add_ledger_transaction = ?icrc3().add_record;
      can_mint = null;
      can_burn = null;
      can_transfer = null;
      can_update = null;
    };
  };

  private func get_icrc37_environment() : ICRC37.Environment {
    {
      canister = get_canister;
      get_time = get_time;
      refresh_state = get_icrc37_state;
      icrc7 = icrc7();
      can_transfer_from = null;
      can_approve_token = null;
      can_approve_collection = null;
      can_revoke_token_approval = null;
      can_revoke_collection_approval = null;
    };
  };

  func icrc7() : ICRC7.ICRC7 {
    switch (_icrc7) {
      case (null) {
        let initclass : ICRC7.ICRC7 = ICRC7.ICRC7(?icrc7_migration_state, Principal.fromActor(this), get_icrc7_environment());
        _icrc7 := ?initclass;
        initclass;
      };
      case (?val) val;
    };
  };

  func icrc37() : ICRC37.ICRC37 {
    switch (_icrc37) {
      case (null) {
        let initclass : ICRC37.ICRC37 = ICRC37.ICRC37(?icrc37_migration_state, Principal.fromActor(this), get_icrc37_environment());
        _icrc37 := ?initclass;
        initclass;
      };
      case (?val) val;
    };
  };

  private var canister_principal : ?Principal = null;

  private func get_canister() : Principal {
    switch (canister_principal) {
      case (null) {
        canister_principal := ?Principal.fromActor(this);
        Principal.fromActor(this);
      };
      case (?val) {
        val;
      };
    };
  };

  private func get_time() : Int {
    //note: you may want to implement a testing framework where you can set this time manually
    /* switch(state_current.testing.time_mode){
          case(#test){
              state_current.testing.test_time;
          };
          case(#standard){
               Time.now();
          };
      }; */
    Time.now();
  };

  public query func icrc7_symbol() : async Text {
    return switch (icrc7().get_ledger_info().symbol) {
      case (?val) val;
      case (null) "";
    };
  };

  public query func icrc7_name() : async Text {
    return switch (icrc7().get_ledger_info().name) {
      case (?val) val;
      case (null) "";
    };
  };

  public query func icrc7_description() : async ?Text {
    return icrc7().get_ledger_info().description;
  };

  public query func icrc7_logo() : async ?Text {
    return icrc7().get_ledger_info().logo;
  };

  public query func icrc7_max_memo_size() : async ?Nat {
    return ?icrc7().get_ledger_info().max_memo_size;
  };

  public query func icrc7_tx_window() : async ?Nat {
    return ?icrc7().get_ledger_info().tx_window;
  };

  public query func icrc7_permitted_drift() : async ?Nat {
    return ?icrc7().get_ledger_info().permitted_drift;
  };

  public query func icrc7_total_supply() : async Nat {
    return icrc7().get_stats().nft_count;
  };

  public query func icrc7_supply_cap() : async ?Nat {
    return icrc7().get_ledger_info().supply_cap;
  };

  public query func icrc7_max_query_batch_size() : async ?Nat {
    return icrc7().max_query_batch_size();
  };

  public query func icrc7_max_update_batch_size() : async ?Nat {
    return icrc7().max_update_batch_size();
  };

  public query func icrc7_default_take_value() : async ?Nat {
    return icrc7().default_take_value();
  };

  public query func icrc7_max_take_value() : async ?Nat {
    return icrc7().max_take_value();
  };

  public query func icrc7_atomic_batch_transfers() : async ?Bool {
    return icrc7().atomic_batch_transfers();
  };

  public query func icrc7_collection_metadata() : async [(Text, Value)] {

    let ledger_info = icrc7().collection_metadata();
    let results = Vec.new<(Text, Value)>();

    Vec.addFromIter(results, ledger_info.vals());

    ///add any addtional metadata here
    //Vec.addFromIter(results, [
    //  ("ICRC-7", #Text("your value"))
    //].vals());

    return Vec.toArray(results);
  };

  public query func icrc7_token_metadata(token_ids : [Nat]) : async [?[(Text, Value)]] {
    return icrc7().token_metadata(token_ids);
  };

  public query func icrc7_owner_of(token_ids : OwnerOfRequest) : async OwnerOfResponse {

    switch (icrc7().get_token_owners(token_ids)) {
      case (#ok(val)) val;
      case (#err(err)) D.trap(err);
    };
  };

  public query func icrc7_balance_of(accounts : BalanceOfRequest) : async BalanceOfResponse {
    return icrc7().balance_of(accounts);
  };

  public query func icrc7_tokens(prev : ?Nat, take : ?Nat) : async [Nat] {
    return icrc7().get_tokens_paginated(prev, take);
  };

  public query func icrc7_tokens_of(account : Account, prev : ?Nat, take : ?Nat) : async [Nat] {
    return icrc7().get_tokens_of_paginated(account, prev, take);
  };

  public query func icrc10_supported_standards() : async ICRC7.SupportedStandards {
    return [{
      name = "ICRC-7";
      url = "https://github.com/dfinity/ICRC/ICRCs/ICRC-7";
    }];
  };

  /////////
  // ICRC3 endpoints
  /////////

  public query func icrc3_get_blocks(args : [ICRC3.TransactionRange]) : async ICRC3.GetTransactionsResult {
    return icrc3().get_blocks(args);
  };

  public query func icrc3_get_archives(args : ICRC3.GetArchivesArgs) : async ICRC3.GetArchivesResult {
    return icrc3().get_archives(args);
  };

  public query func icrc3_supported_block_types() : async [ICRC3.BlockType] {
    return icrc3().supported_block_types();
  };

  public query func icrc3_get_tip_certificate() : async ?ICRC3.DataCertificate {
    return icrc3().get_tip_certificate();
  };

  public query func get_tip() : async ICRC3.Tip {
    return icrc3().get_tip();
  };

  /////////
  // The following functions are not part of ICRC7 or ICRC37. They are provided as examples of how
  // one might deploy an NFT.
  /////////

  public shared (msg) func icrcX_mint(tokens : ICRC7.SetNFTRequest) : async [ICRC7.SetNFTResult] {
    assert (msg.caller == Principal.fromText("5sh5r-gyaaa-aaaap-qkmra-cai"));

    switch (icrc7().set_nfts<system>(msg.caller, tokens, true)) {
      case (#ok(val)) val;
      case (#err(err)) D.trap(err);
    };
  };

  public shared (msg) func icrcX_burn(tokens : ICRC7.BurnNFTRequest) : async ICRC7.BurnNFTBatchResponse {
    assert (msg.caller == Principal.fromText("5sh5r-gyaaa-aaaap-qkmra-cai"));

    switch (icrc7().burn_nfts<system>(msg.caller, tokens)) {
      case (#ok(val)) val;
      case (#err(err)) D.trap(err);
    };
  };

  private stable var _init = true;

  public shared (msg) func init() : async () {
    //can only be called once

    //Warning:  This is a test scenario and should not be used in production.  This creates an approval for the owner of the canister and this can be garbage collected if the max_approvals is hit.  We advise minting with the target owner in the metadata or creating an assign function (see assign)
    if (_init == false) {
      //approve the deployer as a spender on all tokens...
      let current_val = icrc37().get_state().ledger_info.collection_approval_requires_token;
      let update = icrc37().update_ledger_info([#CollectionApprovalRequiresToken(false)]);
      let result = icrc37().approve_collection<system>(Principal.fromActor(this), [{ approval_info = { from_subaccount = null; spender = { owner = icrc7().get_state().owner; subaccount = null }; memo = null; expires_at = null; created_at_time = null } }]);
      let update2 = icrc37().update_ledger_info([#CollectionApprovalRequiresToken(current_val)]);

      D.print(
        "initialized" # debug_show (
          result,
          {
            from_subaccount = null;
            spender = { owner = icrc7().get_state().owner; subaccount = null };
            memo = null;
            expires_at = null;
            created_at_time = null;
          },
        )
      );
    };
    _init := true;
  };

  // Function to initialize archived nfts.
  public shared (msg) func initialize_nfts() : async () {
    assert (msg.caller == Principal.fromText("5sh5r-gyaaa-aaaap-qkmra-cai"));
    await NFTArchive.initialize_nfts(icrc7(), init_msg.caller);
  };

  public shared (msg) func icrc7_transfer(args : [TransferArgs]) : async [?TransferResult] {
    icrc7().transfer(msg.caller, args);

  };

  //In progress
  public shared (msg) func icrc37_transfer_from<system>(args : [TransferFromArg]) : async [?TransferFromResult] {
    let allowedCanister : Principal = Principal.fromText("be2us-64aaa-aaaaa-qaabq-cai");

    for (arg in args.vals()) {
      if (arg.to.owner != allowedCanister) {
        return ? #err(#notAuthorized("Transfer are for Emporium canister only"));
      };
    };

    return icrc37().transfer_from(msg.caller, args);
  };

};
