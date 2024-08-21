import Array "mo:base/Array";
import Blob "mo:base/Blob";
import D "mo:base/Debug";
import Error "mo:base/Error";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import ExperimentalCycles "mo:base/ExperimentalCycles";
import C "mo:matchers/Canister";
import M "mo:matchers/Matchers";
import S "mo:matchers/Suite";
import T "mo:matchers/Testable";
import Text "mo:base/Text";
import Fake "fake";
import RepIndy "mo:rep-indy-hash";


import Example "../example/main";

import ICRC3Types "../src/migrations/types";
import ICRC3 "../src";


shared(init_msg) actor class() = this {

  let baseState = ?{
    maxActiveRecords = 4;
    settleToRecords = 2;
    maxRecordsInArchiveInstance = 6;
    maxArchivePages  = 62500;
    archiveIndexType = #Stable;
    maxRecordsToArchive = 10_000;
    archiveCycles = 2_000_000_000_000; //two trillion
    archiveControllers = null;
    supportedBlocks : [ICRC3Types.Current.BlockType] = [
      {
        block_type = "test";
        url = "url";
      }
    ]
  };

  public shared func test() : async {
        #success;
        #fail : Text;
    } {

        //let Instant_Test = await Instant.test_runner_instant_transfer();
        let suite = S.suite(
            "memory",
            [
              S.test("testIntegrityOfLedgerBlocks", switch(await testIntegrityOfLedgerBlocks()){case(#success){true};case(_){false};}, M.equals<Bool>(T.bool(true))),
              S.test("testTipCertificationMatchesLastBlock", switch(await testTipCertificationMatchesLastBlock()){case(#success){true};case(_){false};}, M.equals<Bool>(T.bool(true))),

             S.test("testGetBlocksEndpointWithEmptyLedger", switch(await testGetBlocksEndpointWithEmptyLedger()){case(#success){true};case(_){false};}, M.equals<Bool>(T.bool(true))),
              S.test("testGetBlocksEndpointWithNonEmptyLedger", switch(await testGetBlocksEndpointWithNonEmptyLedger()){case(#success){true};case(_){false};}, M.equals<Bool>(T.bool(true))),
              S.test("testGetBlocksEndpointWithPaging", switch(await testGetBlocksEndpointWithPaging()){case(#success){true};case(_){false};}, M.equals<Bool>(T.bool(true))),
              S.test("testArchivedBlocksCallbackReturnsCorrectData", switch(await testArchivedBlocksCallbackReturnsCorrectData()){case(#success){true};case(_){false};}, M.equals<Bool>(T.bool(true))),
              
              //S.test("testLatestBlockCertification", switch(await testLatestBlockCertification()){case(#success){true};case(_){false};}, M.equals<Bool>(T.bool(true))),
              S.test("testVerifyBlockLogIntegrity", switch(await testVerifyBlockLogIntegrity()){case(#success){true};case(_){false};}, M.equals<Bool>(T.bool(true))),
              
              S.test("testRetrieveBlockLog", switch(await testRetrieveBlockLog()){case(#success){true};case(_){false};}, M.equals<Bool>(T.bool(true))), 
              S.test("testUpgrade", switch(await testUpgrade()){case(#success){true};case(_){false};}, M.equals<Bool>(T.bool(true))) 
            ],
        );
        S.run(suite);

        return #success;
    };

  public func testIntegrityOfLedgerBlocks() : async { #success; #fail : Text } {
    // Mocking the ledger and transactions
    let ledger = await Example.Example(baseState);

    let transaction1 : ICRC3.Transaction = #Map([
      ("op", #Text("transfer")),
      ("from", #Text("alice")),
      ("to", #Text("bob")),
      ("amount", #Nat(100)),
      ("timestamp", #Nat(1634445987))
    ]);

    let transaction2 : ICRC3.Transaction = #Map([
      ("op", #Text("burn")),
      ("from", #Text("alice")),
      ("amount", #Nat(40)),
      ("timestamp", #Nat(1634445995))
    ]);

    // Adding the transactions to the ledger
    let index1 = await ledger.add_record(transaction1);
    let index2 = await ledger.add_record(transaction2);

    // Retrieving the blocks from the ledger
    let retrievalResult = await ledger.icrc3_get_blocks([{start = 0; length = 2}]);

    // Verify integrity of transaction hashes
    let trxresult1 = ICRC3.helper.get_item_from_map("tx", retrievalResult.blocks[0].block) else D.trap("not a map");
    let trxresult2 = ICRC3.helper.get_item_from_map("tx", retrievalResult.blocks[1].block) else D.trap("not a map");

    //D.print()

    let ?#Blob(derived) = ICRC3.helper.get_item_from_map("phash", retrievalResult.blocks[1].block);

    let suite = S.suite(
      "testIntegrityOfLedgerBlocks",
      [
        S.test(
          "Verify hash of transaction 2 matches",
          debug_show(Blob.fromArray(RepIndy.hash_val(#Map([("tx",transaction1)])))),
          M.equals<Text>(T.text(debug_show(derived))),
        ),
        /* S.test(
          "Verify hash of transaction 2 matches",
          debug_show(RepIndy.hash_val(#Map([("tx",retrievalResult.blocks[1].transaction)]))),
          M.equals<Text>(T.text(debug_show(RepIndy.hash_val(#Map([
            ("tx",transaction2),
            ("phash", #Blob(Blob.fromArray(RepIndy.hash_val(#Map([("tx",transaction1)])))))
          ]))))),
        ), */
      ],
    );

    S.run(suite);

    return #success;
  };

  public func testTipCertificationMatchesLastBlock() : async { #success; #fail : Text } {
    ExperimentalCycles.add(10_000_000_000_000);
    let ledger = await Example.Example(baseState);

    // Adding a block to the ledger
    let transaction : ICRC3.Transaction = #Map([
      ("op", #Text("transfer")),
      ("from", #Text("alice")),
      ("to", #Text("bob")),
      ("amount", #Nat(100)),
      ("timestamp", #Nat(1634445987))
    ]);

    let index = await ledger.add_record(transaction);

    // Verify that the last block hash matches the hash in the tip certificate
    let retrievalResult = await ledger.icrc3_get_blocks([{start = 0; length = 1}]);

    let lastBlock = retrievalResult.blocks[0].block;

    let tip_result = await ledger.get_tip();

    let blockHash = Blob.fromArray(RepIndy.hash_val(lastBlock));

    let suite = S.suite(
      "testTipCertificationMatchesLastBlock",
      [
        S.test(
          "Verify last block hash matches the tip certificate",
          debug_show(blockHash),
          M.equals<Text>(T.text(debug_show(tip_result.last_block_hash))),
        ),
      ],
    );

    S.run(suite);

    return #success;
  };

    public shared func testGetBlocksEndpointWithEmptyLedger() : async  { #success; #fail : Text }{
      ExperimentalCycles.add(10_000_000_000_000);
      let ledger = await Example.Example(baseState);

      // Retrieve the blocks from the empty ledger
      let retrievalResult = await ledger.icrc3_get_blocks([{start = 0; length = 10}]);

      let suite = S.suite(
          "Latest block certification",
          [

      S.test("testGetBlocksEndpointWithEmptyLedger", retrievalResult.log_length, M.equals<Nat>(T.nat(0)))

      ]);

      S.run(suite);

      return #success;
    };

    public shared func testGetBlocksEndpointWithNonEmptyLedger() : async  { #success; #fail : Text }{
      ExperimentalCycles.add(10_000_000_000_000);
      let ledger = await Example.Example(baseState);

      // Populate the ledger with some example transactions
      let transaction1 : ICRC3.Transaction = #Map([
        ("op", #Text("test")),
        ("value", #Nat(1)),
      ]); // Define the first transaction

      let index1 = await ledger.add_record(transaction1);

      // Retrieve the blocks from the non-empty ledger
      let retrievalResult = await ledger.icrc3_get_blocks([{start = 0; length = 10}]);

      let suite = S.suite(
          "testGetBlocksEndpointWithNonEmptyLedger",
          [

      S.test("verify non-empty log for ledger with transactions", retrievalResult.log_length, M.equals<Nat>(T.nat(1)))

      ]);
      S.run(suite);

      return #success;
    };

    public shared func testGetBlocksEndpointWithPaging() : async  { #success; #fail : Text }{
      ExperimentalCycles.add(10_000_000_000_000);
      let ledger = await Example.Example(baseState);

      // Populate the ledger with some example transactions
      let transaction1 : ICRC3.Transaction = #Map([
        ("op", #Text("test")),
        ("value", #Nat(1)),
      ]); // Define the first transaction
      let index1 = await ledger.add_record(transaction1);
      // Add more transactions...

      // Retrieve the blocks with pagination
      let retrievalResult = await ledger.icrc3_get_blocks([{start = 0; length = 1}]);

      let suite = S.suite(
          "testGetBlocksEndpointWithPaging",
          [

      S.test("verify single block retrieval", retrievalResult.blocks.size(), M.equals<Nat>(T.nat(1)))

      ]);
      S.run(suite);

      return #success;
    };

    public shared func testArchivedBlocksCallbackReturnsCorrectData() : async  { #success; #fail : Text }{
      ExperimentalCycles.add(10_000_000_000_000);
      let ledger = await Example.Example(baseState);

      // Populate the ledger with transactions exceeding the active records limit
      for(thisItem in Iter.range(0,9)){
        // Populate the ledger with some example transactions
        let transaction1 : ICRC3.Transaction = #Map([
          ("op", #Text("test")),
          ("value", #Nat(thisItem)),
        ]); // Define the first transaction
        let index1 = await ledger.add_record(transaction1);
      };

        let fake1 = await Fake.Fake();
        D.print("faking ");
        let fake2 = await Fake.Fake();
        let fake3 = await Fake.Fake();
        let fake4 = await Fake.Fake();

      // Retrieve the archived blocks callback
      let retrievalResult = await ledger.icrc3_get_blocks([{start = 5; length = 5}]);

      D.print("found result for local " # debug_show(retrievalResult.blocks));

      D.print("found result for archive " # debug_show(retrievalResult.archived_blocks.size()));
      D.print("found result for archive 0" # debug_show(retrievalResult.archived_blocks[0].args));
      D.print("found result for archive 1" # debug_show(retrievalResult.archived_blocks[1].args));

      let archivedBlocksCallback = retrievalResult.archived_blocks[0];  // assuming there is at least one archived block


      let results = await archivedBlocksCallback.callback(archivedBlocksCallback.args);

      D.print("found result in archive " # debug_show(results.blocks));

      let archivedBlocksCallback2 = retrievalResult.archived_blocks[1];  // assuming there is at least one archived block


      let results2 = await archivedBlocksCallback2.callback(archivedBlocksCallback2.args);

      D.print("found result in archive " # debug_show(results2.blocks));

      // Retrieve the archived blocks callback
      let retrievalResult2 = await ledger.icrc3_get_blocks([{start = 0; length = 2}, {start = 4; length = 4}, {start = 8; length = 2}]);

      D.print("found result for retrievalResult2 " # debug_show(retrievalResult2.blocks));

      D.print("found result for  retrievalResult2 archive " # debug_show(retrievalResult2.archived_blocks.size()));

      D.print("found result for retrievalResult2 archive 1" # debug_show(retrievalResult2.archived_blocks[0].args));

      D.print("found result for retrievalResult2 archive 2" # debug_show(retrievalResult2.archived_blocks[1].args));
      
      // Perform assertions on the retrieved archived blocks callback
      let suite = S.suite(
          "Latest block certification",
          [
            S.test("verify local block retrieval", retrievalResult.blocks.size(), M.equals<Nat>(T.nat(2))),
            S.test("verify archive 1 retrieval", results.blocks.size(), M.equals<Nat>(T.nat(1))),
            S.test("verify archive 2 retrieval", results2.blocks.size(), M.equals<Nat>(T.nat(2)))
          ]);

      S.run(suite);

      return #success;
    };

    //this test won't work because retriving a cert from motoko always returns a null as the query is translated to an update call.
    /* public func testLatestBlockCertification() : async { #success; #fail : Text } {
      ExperimentalCycles.add(10_000_000_000_000);
      let ledger = await Example.Example(baseState);

      let addRoles3 = await ledger.addRole("test1b");
      let addRoles4 = await ledger.addRole("test1c");

      // Request the tip certificate
      let tipCertificate = await ledger.icrc3_get_tip_certificate();

      D.print("cert was" # debug_show(tipCertificate));

      // Suite of tests for the response
      let suite = S.suite(
          "Latest block certification",
          [
              S.test(
                  "fail if certificate is not received",
                  tipCertificate,
                  M.isSome<ICRC3.DataCertificate>(),
              ),
              
          ],
      );

      S.run(suite);
      return #success;
  }; */

    public func testVerifyBlockLogIntegrity() : async{ #success; #fail : Text } { 
    let ledger = await Example.Example(baseState);

    // Add a transaction to the ledger
    let transaction1 : ICRC3.Transaction = #Map([
        ("op", #Text("transfer")),
        ("from", #Text("alice")),
        ("to", #Text("bob")),
        ("amount", #Nat(100)),
        ("timestamp", #Nat(1634445987))
    ]);
    let index1 = await ledger.add_record(transaction1);

    let transaction2 : ICRC3.Transaction = #Map([
        ("op", #Text("transfer")),
        ("from", #Text("alice")),
        ("to", #Text("bob")),
        ("amount", #Nat(200)),
        ("timestamp", #Nat(1634445988))
    ]);
    let index2 = await ledger.add_record(transaction2);

    let transaction3 : ICRC3.Transaction = #Map([
        ("op", #Text("transfer")),
        ("from", #Text("alice")),
        ("to", #Text("bob")),
        ("amount", #Nat(230)),
        ("timestamp", #Nat(1634445989))
    ]);
    let index3 = await ledger.add_record(transaction2);

    // Retrieve the blocks from the ledger
    let retrievalResult = await ledger.icrc3_get_blocks([{start = 0; length = 3}]);
    D.print("retrievalResult"  # debug_show(retrievalResult.blocks));
    // Verify the integrity of the block log

    let ?#Blob(secondBlockHash) = ICRC3.helper.get_item_from_map("phash", retrievalResult.blocks[1].block);

    let ?#Blob(thirdBlockHash) = ICRC3.helper.get_item_from_map("phash", retrievalResult.blocks[2].block);

    
    let blockTxHash = Blob.fromArray(RepIndy.hash_val(#Map([("tx",transaction1)])));

    let expectedHash2 = Blob.fromArray(RepIndy.hash_val(retrievalResult.blocks[0].block));
    
    let expectedHash3 = Blob.fromArray(RepIndy.hash_val(retrievalResult.blocks[1].block));

    D.print("running hash");

    let suite = S.suite(
        "verify block log integrity",
        [
            
            S.test(
                "hashes match 1",
                debug_show(blockTxHash : Blob),
                M.equals<Text>(T.text(debug_show(secondBlockHash))), 
            ),
            S.test(
                "hashes match 2",
                debug_show(thirdBlockHash: Blob),
                M.equals<Text>(T.text(debug_show(expectedHash3 : Blob))), 
            )
        ]
    );

    // Run the test suite
    S.run(suite);

    return #success;
  } ;

    public func testRetrieveBlockLog() : async { #success; #fail : Text } {

      ExperimentalCycles.add(10_000_000_000_000);
      let ledger = await Example.Example(baseState);

      // Populate the ledger with some example transactions
      let transaction1 : ICRC3.Transaction = #Map([
        ("op", #Text("transfer")),
        ("from", #Text("alice")),
        ("to", #Text("bob")),
        ("amount", #Nat(100)),
        ("timestamp", #Nat(1634445987))
      ]);
      
      let transaction2 : ICRC3.Transaction = #Map([
        ("op", #Text("burn")),
        ("from", #Text("alice")),
        ("amount", #Nat(40)),
        ("timestamp", #Nat(1634445995))
      ]);
      
      let index1 = await ledger.add_record(transaction1);
      let index2 = await ledger.add_record(transaction2);

      // Retrieve the blocks from the ledger
      let retrievalResult = await ledger.icrc3_get_blocks([{start = 0; length = 2}]);

      D.print("have retrieval" # debug_show(retrievalResult.blocks, retrievalResult.log_length));

      assert(retrievalResult.log_length == 2); //, "Block log length should be 2"

      

      let ?trxresult1 = ICRC3.helper.get_item_from_map("tx",retrievalResult.blocks[0].block) else D.trap("not a map");

      let ?trxresult2 = ICRC3.helper.get_item_from_map("tx",retrievalResult.blocks[1].block)  else D.trap("not a map");

      let suite = S.suite(
            "test upgrade",
            [

                S.test(
                    "fail hashes don't match for 1",
                    debug_show(RepIndy.hash_val(trxresult1)),
                    M.equals<Text>(T.text(debug_show(RepIndy.hash_val(transaction1)))), 
                ), 
                 S.test(
                    "fail hashes don't match for 2",
                    debug_show(RepIndy.hash_val(trxresult2)),
                    M.equals<Text>(T.text(debug_show(RepIndy.hash_val(transaction2)))), 
                ), 
               
                
            ],
        );

        S.run(suite);

      return #success;
    };

    public shared func testUpgrade() : async { #success; #fail : Text } {
        
        //create a bucket canister
        D.print("testing Upgrade start");

        ExperimentalCycles.add(10_000_000_000_000);
        let childv1 = await Example.Example(baseState);

        D.print("have canister " # debug_show(Principal.fromActor(childv1)));

        //check it is empty

        let emptyResponse : ICRC3Types.Current.GetTransactionsResult = try{
          await childv1.icrc3_get_blocks([{start=0; length=1000}]);
        } catch(e){
          D.print("had error " # Error.message(e));
          { 
            archived_blocks = [];
            certificate = null;
            log_length = 99999;
            blocks =[];
          };
        };

        D.print("have a response " # debug_show(emptyResponse.log_length));

        //add some data
        //D.print("reading preResponse2 " # debug_show(dataResponse));
        let addRoles1 = await childv1.addRole("test1");
        D.print("have a log result " # debug_show(addRoles1));
        let addRoles2 = await childv1.addRole("test1a");
        D.print("have a log result " # debug_show(addRoles2));
        let addRoles3 = await childv1.addRole("test1b");
        let addRoles4 = await childv1.addRole("test1c");
        let addRoles5 = await childv1.addRole("test1e");
        let addRoles6 = await childv1.addRole("testf");
        let addRoles7 = await childv1.addRole("test1g");
        let addRoles8 = await childv1.addRole("test1h");
        let addRoles9 = await childv1.addRole("test1i");
        let addRoles10 = await childv1.addRole("test1j");
        let addRoles11 = await childv1.addRole("test1k");
        let addRoles12 = await childv1.addRole("test1l");
        let addRoles13 = await childv1.addRole("test1m");
        let addRoles14 = await childv1.addRole("test1n");
        let addRoles15 = await childv1.addRole("test1o");
        let addRoles16 = await childv1.addRole("test1p");

        //simulate rounds by creating a canister
        D.print("faking ");
        let fake1 = await Fake.Fake();
        D.print("faking ");
        let fake2 = await Fake.Fake();
        let fake3 = await Fake.Fake();
        let fake4 = await Fake.Fake();


        D.print("about to try full response ");
        let fullResponse = try{
          await childv1.icrc3_get_blocks([{start=0; length=1000}]);
        } catch(e){
          D.print("had error with full " # Error.message(e));
          { 
            archived_blocks = [];
            certificate = null;
            log_length = 99999;
            blocks =[];
          };
        };

        D.print("length was " # debug_show(fullResponse.log_length));
        D.print("transactions was " # debug_show(fullResponse.blocks));
        D.print("archive was " # debug_show(Array.map<ICRC3Types.Current.ArchivedTransactionResponse, (Principal, ICRC3Types.Current.TransactionRange)>(fullResponse.archived_blocks, func(x: ICRC3Types.Current.ArchivedTransactionResponse) : (Principal, ICRC3Types.Current.TransactionRange){
          (Principal.fromActor(this), x.args[0])
        })));



        D.print("reading smallLocalResponse ");
        let smallLocalResponse = try{
          await childv1.icrc3_get_blocks([{start=15; length=1}]);
        } catch(e){
          D.print("had error with full " # Error.message(e));
          { 
            archived_blocks = [];
            certificate = null;
            log_length = 99999;
            blocks =[];
          };
        };

        D.print("length was " # debug_show(smallLocalResponse.log_length));
        D.print("transactions was " # debug_show(smallLocalResponse.blocks));
        D.print("archive was " # debug_show(Array.map<ICRC3Types.Current.ArchivedTransactionResponse, (Principal, ICRC3Types.Current.TransactionRange)>(smallLocalResponse.archived_blocks, func(x: ICRC3Types.Current.ArchivedTransactionResponse) : (Principal, ICRC3Types.Current.TransactionRange){
          (Principal.fromActor(this), x.args[0]) //note...not actual item
        })));

        //D.print("reading preResponse3 " # debug_show(dataResponse));
        let smallArchiveResponse = try{
          await childv1.icrc3_get_blocks([{start=1; length=3}]);
        } catch(e){
          D.print("had error with full " # Error.message(e));
          { 
            archived_blocks = [];
            certificate = null;
            log_length = 99999;
            blocks =[];
          };
        };

        D.print("length was " # debug_show(smallArchiveResponse.log_length));
        D.print("transactions was " # debug_show(smallArchiveResponse.blocks));
        D.print("archive was " # debug_show(Array.map<ICRC3Types.Current.ArchivedTransactionResponse, (Principal, ICRC3Types.Current.TransactionRange)>(smallArchiveResponse.archived_blocks, func(x: ICRC3Types.Current.ArchivedTransactionResponse) : (Principal, ICRC3Types.Current.TransactionRange){
          (Principal.fromActor(this), x.args[0])
        })));

        //D.print("reading preResponse3 " # debug_show(dataResponse));
        let largeArchiveResponse = try{
          await childv1.icrc3_get_blocks([{start=1; length=8}]);
        } catch(e){
          D.print("had error with full " # Error.message(e));
          { 
            archived_blocks = [];
            certificate = null;
            log_length = 99999;
            blocks =[];
          };
        };

        D.print("length was " # debug_show(largeArchiveResponse.log_length));
        D.print("transactions was " # debug_show(largeArchiveResponse.blocks));
        D.print("archive was " # debug_show(Array.map<ICRC3Types.Current.ArchivedTransactionResponse, (Principal, ICRC3Types.Current.TransactionRange)>(largeArchiveResponse.archived_blocks, func(x: ICRC3Types.Current.ArchivedTransactionResponse) : (Principal, ICRC3Types.Current.TransactionRange){
          (Principal.fromActor(this), x.args[0])
        }))); 


        D.print("made it to tests ");
        //test responses

        let suite = S.suite(
            "test upgrade",
            [

                S.test(
                    "fail if log isn't initally empty",
                    emptyResponse.log_length,
                    M.equals<Nat>(T.nat(0)), 
                ), 
                S.test(
                    "fail if items aren't logged",
                    fullResponse.log_length,
                    M.equals<Nat>(T.nat(16)), //max pages is 64 and this is the cutoff
                ),
                S.test(
                    "fail if local return is wrong size",
                    smallLocalResponse.blocks.size(),
                    M.equals<Nat>(T.nat(1)), //max pages is 64 and this is the cutoff
                ),
                S.test(
                    "fail if local return has archive",
                    smallLocalResponse.archived_blocks.size(),
                    M.equals<Nat>(T.nat(0)), //max pages is 64 and this is the cutoff
                ),
                S.test(
                    "fail if small archive return is wrong size",
                    smallArchiveResponse.blocks.size(),
                    M.equals<Nat>(T.nat(0)), //max pages is 64 and this is the cutoff
                ),
                S.test(
                    "fail if small archive return has archive",
                    smallArchiveResponse.archived_blocks.size(),
                    M.equals<Nat>(T.nat(1)), //max pages is 64 and this is the cutoff
                ),
                S.test(
                    "fail if length is wrong for small archive",
                    smallArchiveResponse.archived_blocks[0].args[0].length,
                    M.equals<Nat>(T.nat(3)), //max pages is 64 and this is the cutoff
                ),
                S.test(
                    "fail if start is wrong for small archive",
                    smallArchiveResponse.archived_blocks[0].args[0].start,
                    M.equals<Nat>(T.nat(1)), //max pages is 64 and this is the cutoff
                ),

                S.test(
                    "fail if large archive return is wrong size",
                    largeArchiveResponse.blocks.size(),
                    M.equals<Nat>(T.nat(0)), //max pages is 64 and this is the cutoff
                ),
                S.test(
                    "fail if large archive return has archive",
                    largeArchiveResponse.archived_blocks.size(),
                    M.equals<Nat>(T.nat(2)), //max pages is 64 and this is the cutoff
                ),
                S.test(
                    "fail if length is wrong for large archive",
                    largeArchiveResponse.archived_blocks[0].args[0].length,
                    M.equals<Nat>(T.nat(5)), //max pages is 64 and this is the cutoff
                ),
                S.test(
                    "fail if start is wrong for large archive",
                    largeArchiveResponse.archived_blocks[0].args[0].start,
                    M.equals<Nat>(T.nat(1)), //max pages is 64 and this is the cutoff
                ),
                S.test(
                    "fail if length is wrong for large archive",
                    largeArchiveResponse.archived_blocks[1].args[0].length,
                    M.equals<Nat>(T.nat(3)), //max pages is 64 and this is the cutoff
                ),
                S.test(
                    "fail if start is wrong for large archive",
                    largeArchiveResponse.archived_blocks[1].args[0].start,
                    M.equals<Nat>(T.nat(6)), //max pages is 64 and this is the cutoff
                )


                
            ],
        );

        

        S.run(suite);

        return #success;
    };



};