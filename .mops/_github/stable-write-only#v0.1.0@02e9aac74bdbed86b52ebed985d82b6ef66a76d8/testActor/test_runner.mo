import Array "mo:base/Array";
import D "mo:base/Debug";
import Principal "mo:base/Principal";
import C "mo:matchers/Canister";
import M "mo:matchers/Matchers";
import S "mo:matchers/Suite";
import T "mo:matchers/Testable";

import Child1 "childv1";
import Child2 "childv2";


shared(init_msg) actor class() = this {




public shared func test() : async {
        #success;
        #fail : Text;
    } {

        //let Instant_Test = await Instant.test_runner_instant_transfer();
        let suite = S.suite(
            "memory",
            [
              //S.test("testUpgrade", switch(await testUpgrade()){case(#success){true};case(_){false};}, M.equals<Bool>(T.bool(true))),
              //S.test("testSwap", switch(await testSwap()){case(#success){true};case(_){false};}, M.equals<Bool>(T.bool(true))),
              //S.test("testStableIndex", switch(await testStableIndex()){case(#success){true};case(_){false};}, M.equals<Bool>(T.bool(true))),

              S.test("testStableTypedIndex", switch(await testStableTypedIndex()){case(#success){true};case(_){false};}, M.equals<Bool>(T.bool(true))),

              // Unfortunately the big data test stalls out in the local replica. Will need to be run in prod with a similiar schema to load in > 4GB of data.
              //S.test("testBigData", switch(await testBigData()){case(#success){true};case(_){false};}, M.equals<Bool>(T.bool(true))),

              
            ],
        );
        S.run(suite);

        return #success;
    };

    public shared func testUpgrade() : async { #success; #fail : Text } {
        
        //create a bucket canister
        D.print("testing Upgrade start");

        let childv1 = await Child1.Child1(null);

        D.print("have canister " # debug_show(Principal.fromActor(childv1)));

        //load it with data

        let dataResponse = await childv1.putLotsOfData(200000);

        D.print("data was put " # debug_show(dataResponse));

        //check that the memory endured
        //D.print("reading preResponse2 " # debug_show(dataResponse));
        let ?preResponse2 = await childv1.read(0) else D.trap("bad read preResponse2");
        //D.print("reading preResponse3 " # debug_show(dataResponse));
        let ?preResponse3 = await childv1.read(999) else D.trap("bad read preResponse3");

        D.print("data was " # debug_show(preResponse2, preResponse3));

        let preResponse4 = await childv1.putData({
          one = 55;
          two = "test55";
          three = 55 : Nat64;
        }) else D.trap("bad read preResponse4");


        //mem should be full, try to put one more object

        //upgrade it

        let childv2 = await (system Child2.Child2)(#upgrade childv1)();

        D.print("upgrade finished " # debug_show(Principal.fromActor(childv2)));


        //check that the memory endured
        let ?dataResponse2 = await childv1.read(0) else D.trap("bad read dataResponse2");
        let ?dataResponse3 = await childv1.read(999) else D.trap("bad read dataResponse3");
        D.print("data was " # debug_show(dataResponse2, dataResponse3));

        let finalStats = await childv1.stats() else D.trap("bad read finalStats");
        D.print("stats were " # debug_show(finalStats));


        //test responses

        let suite = S.suite(
            "test upgrade",
            [

                S.test(
                    "fail if stats don't match",
                    dataResponse.itemCount,
                    M.equals<Nat>(T.nat(105_270)), //max pages is 64 and this is the cutoff
                ), 
                S.test(
                    "fail if stats don't match",
                    dataResponse.currentPages,
                    M.equals<Nat64>(T.nat64(64)), //max pages is 64 and this is the cutoff
                ), 
                S.test(
                    "fail if can't read memory",
                    preResponse2.one,
                    M.equals<Nat>(T.nat(0)),
                ), 
                S.test(
                    "fail if can't read whole memeory",
                    preResponse3.one,
                    M.equals<Nat>(T.nat(999)),
                ), 
                S.test(
                    "fail if can't read memory after upgrade",
                    dataResponse2.one,
                    M.equals<Nat>(T.nat(0)),
                ), 
                 S.test(
                    "fail if can't read whole memory after upgrade",
                    dataResponse3.one,
                    M.equals<Nat>(T.nat(999)),
                ), 
                 S.test(
                    "fail if writing data doesn't return full memory",
                    switch(preResponse4){
                      case(#err(#MemoryFull)) "correct response";
                      case(_) "wrong response" # debug_show(preResponse4);
                    },
                    M.equals<Text>(T.text("correct response")),
                ), 
               

            ],
        );

        

        S.run(suite);

        return #success;
    };


    public shared func testStableIndex() : async { #success; #fail : Text } {
        
        //create a bucket canister
        D.print("testing StableIndex start");

        let childv1 = await Child1.Child1(?#Stable);

        D.print("have canister " # debug_show(Principal.fromActor(childv1)));

        //load it with data

        let dataResponse = await childv1.putLotsOfData(200000);

        D.print("data was put " # debug_show(dataResponse));

        //check that the memory endured
        //D.print("reading preResponse2 " # debug_show(dataResponse));
        let ?preResponse2 = await childv1.read(0) else D.trap("bad read preResponse2");
        //D.print("reading preResponse3 " # debug_show(dataResponse));
        let ?preResponse3 = await childv1.read(999) else D.trap("bad read preResponse3");

        D.print("data was " # debug_show(preResponse2, preResponse3));

        let preResponse4 = await childv1.putData({
          one = 55;
          two = "test55";
          three = 55 : Nat64;
        }) else D.trap("bad read preResponse4");


        //mem should be full, try to put one more object

        //upgrade it

        let childv2 = await (system Child2.Child2)(#upgrade childv1)();

        D.print("upgrade finished " # debug_show(Principal.fromActor(childv2)));


        //check that the memory endured
        let ?dataResponse2 = await childv1.read(0) else D.trap("bad read dataResponse2");
        let ?dataResponse3 = await childv1.read(999) else D.trap("bad read dataResponse3");
        D.print("data was " # debug_show(dataResponse2, dataResponse3));

        let finalStats = await childv1.stats() else D.trap("bad read finalStats");
        D.print("stats were " # debug_show(finalStats));


        //test responses

        let suite = S.suite(
            "test upgrade",
            [

                S.test(
                    "fail if stats don't match",
                    dataResponse.itemCount,
                    M.equals<Nat>(T.nat(105_270)), //max pages is 64 and this is the cutoff
                ), 
                S.test(
                    "fail if stats don't match",
                    dataResponse.currentPages,
                    M.equals<Nat64>(T.nat64(64)), //max pages is 64 and this is the cutoff
                ), 
                S.test(
                    "fail if can't read memory",
                    preResponse2.one,
                    M.equals<Nat>(T.nat(0)),
                ), 
                S.test(
                    "fail if can't read whole memeory",
                    preResponse3.one,
                    M.equals<Nat>(T.nat(999)),
                ), 
                S.test(
                    "fail if can't read memory after upgrade",
                    dataResponse2.one,
                    M.equals<Nat>(T.nat(0)),
                ), 
                 S.test(
                    "fail if can't read whole memory after upgrade",
                    dataResponse3.one,
                    M.equals<Nat>(T.nat(999)),
                ), 
                 S.test(
                    "fail if writing data doesn't return full memory",
                    switch(preResponse4){
                      case(#err(#MemoryFull)) "correct response";
                      case(_) "wrong response" # debug_show(preResponse4);
                    },
                    M.equals<Text>(T.text("correct response")),
                ), 
               

            ],
        );

        

        S.run(suite);

        return #success;
    };

    public shared func testStableTypedIndex() : async { #success; #fail : Text } {
        
        //create a bucket canister
        D.print("testing StableIndex start");

        let childv1 = await Child1.Child1(?#StableTyped);

        D.print("have canister " # debug_show(Principal.fromActor(childv1)));

        //load it with data

        let dataResponse = await childv1.putLotsOfTypedData(200000);

        D.print("data was put " # debug_show(dataResponse));

        //check that the memory endured
        D.print("reading preResponse2 " # debug_show(dataResponse));
        let ?preResponse2 = await childv1.readTyped(0) else D.trap("bad read preResponse2");
        D.print("reading preResponse3 " # debug_show(dataResponse));
        let ?preResponse3 = await childv1.readTyped(999) else D.trap("bad read preResponse3");

        D.print("data was " # debug_show(preResponse2, preResponse3));

        let preResponse4 = await childv1.putData({
          one = 55;
          two = "test55";
          three = 55 : Nat64;
        }) else D.trap("bad read preResponse4");


        //mem should be full, try to put one more object

        //upgrade it

        let childv2 = await (system Child2.Child2)(#upgrade childv1)();

        D.print("upgrade finished " # debug_show(Principal.fromActor(childv2)));


        //check that the memory endured
        let ?dataResponse2 = await childv1.readTyped(0) else D.trap("bad read dataResponse2");
        let ?dataResponse3 = await childv1.readTyped(999) else D.trap("bad read dataResponse3");
        D.print("data was " # debug_show(dataResponse2, dataResponse3));

        let finalStats = await childv1.stats() else D.trap("bad read finalStats");
        D.print("stats were " # debug_show(finalStats));


        //test responses

        let suite = S.suite(
            "test upgrade",
            [

                S.test(
                    "fail if stats don't match",
                    dataResponse.itemCount,
                    M.equals<Nat>(T.nat(121_813)), //max pages is 64 and this is the cutoff
                ), 
                S.test(
                    "fail if stats don't match",
                    dataResponse.currentPages,
                    M.equals<Nat64>(T.nat64(64)), //max pages is 64 and this is the cutoff
                ), 
                S.test(
                    "fail if can't read memory",
                    switch(preResponse2){
                      case(#TestType1(val)){
                        if(val.one == 0){
                          "correct response";
                        } else {
                          "wrong response"
                        };
                      };
                      case(_) "wrong response";
                    },
                    M.equals<Text>(T.text("correct response")),
                ), 
                S.test(
                    "fail if can't read whole memeory",
                    switch(preResponse3){
                      case(#TestType3(val)){
                        switch(val.five){
                          case(#six) "correct response";
                          case(_) "wrong response"
                        };
                      };
                      case(_) "wrong response";
                    },
                    M.equals<Text>(T.text("correct response")),
                ), 
                S.test(
                    "fail if can't read memory after upgrade",
                    switch(dataResponse2){
                      case(#TestType1(val)){
                        if(val.one == 0){
                          "correct response";
                        } else {
                          "wrong response"
                        };
                      };
                      case(_) "wrong response";
                    },
                    M.equals<Text>(T.text("correct response")),
                ), 
                 S.test(
                    "fail if can't read whole memory after upgrade",
                     switch(dataResponse3){
                      case(#TestType3(val)){
                        switch(val.five){
                          case(#six) "correct response";
                          case(_) "wrong response"
                        };
                      };
                      case(_) "wrong response";
                    },
                    M.equals<Text>(T.text("correct response")),
                ), 
                 S.test(
                    "fail if writing data doesn't return full memory",
                    switch(preResponse4){
                      case(#err(#MemoryFull)) "correct response";
                      case(_) "wrong response" # debug_show(preResponse4);
                    },
                    M.equals<Text>(T.text("correct response")),
                ), 
               

            ],
        );

        

        S.run(suite);

        return #success;
    };

    /// This test ensures that a canister can swap out one memory for another.  This could be 
    /// useful if the entire stream needs to be upgraded to a new type.
    public shared func testSwap() : async { #success; #fail : Text } {
        //create a bucket canister
        D.print("testing swap start");

        let childv1 = await Child1.Child1(null);

        D.print("have canister " # debug_show(Principal.fromActor(childv1)));

        //load it with data

        let dataResponse = await childv1.putData({
          one = 1;
          two = "two";
          three = 3 : Nat64
        });

        D.print("data was put " # debug_show(dataResponse));

        //check that the memory endured
        //D.print("reading preResponse2 " # debug_show(dataResponse));
        let ?preResponse2 = await childv1.read(0) else D.trap("bad read preResponse2");

        D.print("data was " # debug_show(preResponse2));

        let preResponse4 = await childv1.swapMemory() else D.trap("bad read preResponse4");


        //should have new object

        let ?postResponse2 = await childv1.read(0) else D.trap("bad read preResponse2");

        //upgrade it

        let finalStats = await childv1.stats() else D.trap("bad read finalStats");
        D.print("stats were " # debug_show(finalStats));


        //test responses

        let suite = S.suite(
            "test swap",
            [
                S.test(
                    "fail if can't read memory",
                    preResponse2.one,
                    M.equals<Nat>(T.nat(1)),
                ), 
               
                S.test(
                    "fail if memory doesn't change after swap",
                    postResponse2.one,
                    M.equals<Nat>(T.nat(55)),
                ), 
                 S.test(
                    "fail max pages isn't smaller",
                    finalStats.maxPages,
                    M.equals<Nat64>(T.nat64(32)),
                ), 
                
               

            ],
        );

        

        S.run(suite);

        return #success;
    };

    public shared func testBigData() : async { #success; #fail : Text } {
        
        //create a bucket canister
        D.print("testing BigData");

        let childv1 = await Child1.Child1(null);

        D.print("have canister " # debug_show(Principal.fromActor(childv1)));

        //update max beyond reasonable limit
        let maxPagesResponse= await childv1.updateMaxPages(62501); //should be one more than default

        //load it with data
        var tracker = 0;
        
        label repeater loop{
          let dataResponseFill = await childv1.putLotsOfData(2000000);
          let dataResponseFill2 = await childv1.putLotsOfData(2000000);
          let dataResponseFill3 = await childv1.putLotsOfData(2000000);
          let dataResponseFill4 = await childv1.putLotsOfData(2000000);
          let dataResponseFill5 = await childv1.putLotsOfData(2000000);

          D.print("finished loop " # debug_show(tracker));

          tracker += 1;
          if(tracker >= 11) break repeater;
        };
        

        //D.print("data was put " # debug_show(dataResponseFill));

        //check that the memory endured
        //D.print("reading preResponse2 " # debug_show(dataResponse));
        let ?preResponse2 = await childv1.read(0) else D.trap("bad read preResponse2");
        //D.print("reading preResponse3 " # debug_show(dataResponse));
        let ?preResponse3 = await childv1.read(999) else D.trap("bad read preResponse3");

        D.print("data was " # debug_show(preResponse2, preResponse3));

        let preResponse4 = await childv1.putData({
          one = 55;
          two = "test55";
          three = 55 : Nat64;
        }) else D.trap("bad read preResponse4");

        //upgrade it

        let childv2 = await (system Child2.Child2)(#upgrade childv1)();

        D.print("upgrade finished " # debug_show(Principal.fromActor(childv2)));


        //check that the memory endured
        let ?dataResponse2 = await childv1.read(0) else D.trap("bad read dataResponse2");
        let ?dataResponse3 = await childv1.read(999) else D.trap("bad read dataResponse3");
        D.print("data was " # debug_show(dataResponse2, dataResponse3));

        let finalStats = await childv1.stats() else D.trap("bad read finalStats");
        D.print("stats were " # debug_show(finalStats));


        //test responses

        let suite = S.suite(
            "test upgrade",
            [

                
                
                S.test(
                    "fail if can't read memory",
                    preResponse2.one,
                    M.equals<Nat>(T.nat(0)),
                ), 
                S.test(
                    "fail if can't read whole memeory",
                    preResponse3.one,
                    M.equals<Nat>(T.nat(999)),
                ), 
                S.test(
                    "fail if can't read memory after upgrade",
                    dataResponse2.one,
                    M.equals<Nat>(T.nat(0)),
                ), 
                 S.test(
                    "fail if can't read whole memory after upgrade",
                    dataResponse3.one,
                    M.equals<Nat>(T.nat(999)),
                ), 
                S.test(
                    "fail if writing data doesn't return full memory",
                    switch(preResponse4){
                      case(#err(#MemoryFull)) "correct response";
                      case(_) "wrong response" # debug_show(preResponse4);
                    },
                    M.equals<Text>(T.text("correct response")),
                ), 
               

            ],
        );

        

        S.run(suite);

        return #success;
    };

};