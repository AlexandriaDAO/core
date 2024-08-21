import StableWrite "../src";
import {test} "mo:test";


test("simple test", func() {
	assert true;
});


test("simple test", func() {
	assert true;
});

test("intializes with 4GB", func() {

  let astable = StableWrite.StableWriteOnly(null);

  let stats = astable.stats();
	assert (stats.maxPages == 62500);
});

test("can write object with null initiation", func() {

  let astable = StableWrite.StableWriteOnly(null);

  type atest = {
    one: Nat;
    two: Text;
    three: Nat64;
  };

  let x = {
    one = 10 : Nat;
    two = "test";
    three = 15;
  };

  let #ok(id) = astable.write(to_candid(x)) else return assert(false);
  assert(id == 0);

  let ?myobj = from_candid(astable.read(id)) : ?atest else return assert(false);
  assert(myobj.one == 10);
  assert(myobj.two == "test");
  assert(myobj.three == 15);

	assert true;
});