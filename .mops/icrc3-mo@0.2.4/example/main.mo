import Vec "mo:vector";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Timer "mo:base/Timer";
import Nat "mo:base/Nat";
import Blob "mo:base/Blob";
import CertifiedData "mo:base/CertifiedData";
import CertTree "mo:cert/CertTree";

import D "mo:base/Debug";

import ICRC3 "../src";

shared(init_msg) actor class Example(_args: ICRC3.InitArgs) = this {

  stable let cert_store : CertTree.Store = CertTree.newStore();
  let ct = CertTree.Ops(cert_store);

  D.print("initalizing example");
  stable var icrc3_migration_state = ICRC3.init(ICRC3.initialState() , #v0_1_0(#id), _args, init_msg.caller);

  D.print("loading the state");

  

  let #v0_1_0(#data(icrc3_state_current)) = icrc3_migration_state;

  D.print("loaded the state");

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

  private func get_certificate_store() : CertTree.Store {
    D.print("returning cert store " # debug_show(cert_store));
    return cert_store;
  };

  private func get_time() : Int{
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

  func get_state() : ICRC3.CurrentState{
    return icrc3_state_current;
  };

  public type Environment = {
    canister : () -> Principal;
    get_time : () -> Int;
    refresh_state: () -> ICRC3.CurrentState;
  };

  func get_environment() : Environment {
    {
      canister = get_canister;
      get_time = get_time;
      refresh_state = get_state;
    };
  };

  private var _icrc3 : ?ICRC3.ICRC3 = null;

  private func get_icrc3_environment() : ICRC3.Environment{
    ?{
      updated_certification = ?updated_certification;
      get_certificate_store = ?get_certificate_store;
    };
  };

  private func updated_certification(cert: Blob, lastIndex: Nat) : Bool{

    D.print("updating the certification " # debug_show(CertifiedData.getCertificate(), ct.treeHash()));
    ct.setCertifiedData();
    D.print("did the certification " # debug_show(CertifiedData.getCertificate()));
    return true;
  };

  func icrc3() : ICRC3.ICRC3 {
    switch(_icrc3){
      case(null){
        let initclass : ICRC3.ICRC3 = ICRC3.ICRC3(?icrc3_migration_state, Principal.fromActor(this), get_icrc3_environment());
        _icrc3 := ?initclass;

        if(initclass.stats().supportedBlocks.size() == 0){
          initclass.update_supported_blocks([
            {block_type = "uupdate_user"; url="https://git.com/user"},
            {block_type ="uupdate_role"; url="https://git.com/user"},
            {block_type ="uupdate_use_role"; url="https://git.com/user"}
          ])
        };
        initclass;
      };
      case(?val) val;
    };
  };

  public query func icrc3_get_blocks(args: ICRC3.GetBlocksArgs) : async ICRC3.GetBlocksResult{
    return icrc3().get_blocks(args);
  };

  public query func icrc3_get_archives(args: ICRC3.GetArchivesArgs) : async ICRC3.GetArchivesResult{
    return icrc3().get_archives(args);
  };

  public query func icrc3_supported_block_types() : async [ICRC3.BlockType]{
    return icrc3().supported_block_types();
  };

  public query func icrc3_get_tip_certificate() : async ?ICRC3.DataCertificate {
    return icrc3().get_tip_certificate();
  };

  public query func get_tip() : async ICRC3.Tip {
    return icrc3().get_tip();
  };

  public shared(msg) func addUser(user: (Principal, Text)) : async Nat {

    return icrc3().add_record(#Map([
      ("principal", #Blob(Principal.toBlob(user.0))),
      ("username", #Text(user.1)),
      ("timestamp", #Int(get_time())),
      ("caller", #Blob(Principal.toBlob(msg.caller)))
    ]), ?#Map([("type", #Text("uupdate_user"))]));
  };

  public shared(msg) func addRole(role: Text) : async Nat {
    return icrc3().add_record(#Map([
      ("role", #Text(role)),
      ("timestamp", #Int(get_time())),
      ("caller", #Blob(Principal.toBlob(msg.caller)))
    ]), ?#Map([("type", #Text("uupdate_role"))]));
  };

  public shared(msg) func add_record(x: ICRC3.Transaction): async Nat{
    return icrc3().add_record(x, null);
  };

  public shared(msg) func addUserToRole(x: {role: Text; user: Principal; flag: Bool}) : async Nat {
    return icrc3().add_record(#Map([
      ("principal", #Blob(Principal.toBlob(x.user))),
      ("role", #Text(x.role)),
      ("flag", #Blob(
        if(x.flag){
          Blob.fromArray([1]);
        } else {
          Blob.fromArray([0]);
        }
      )),
      ("timestamp", #Int(get_time())),
      ("caller", #Blob(Principal.toBlob(msg.caller)))
    ]),  ?#Map([("type", #Text("uupdate_use_role"))]));
  };

};