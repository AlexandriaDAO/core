# Motoko Testing
Easy way to write tests in Motoko and run them with `mops test`.

The library supports [Mops Message Format v1.0](https://github.com/ZenVoich/mops-message-format#v10).

## Features
- [Simple tests](#simple-test)
- [Test suites](#test-suites)
- [Skip tests](#skip-test)
- [Async tests](#async-tests)
- [Expect](#expect)

## Install
```
mops add test --dev
```

## Usage
Put your tests in `test` directory in `*.test.mo` files.

Use `test` and `suite` functions in conjunction with `assert` expression.

Run `mops test` to run tests.

## Simple test

```motoko
import {test} "mo:test";

test("simple test", func() {
    assert true;
});

test("test my number", func() {
    assert 1 > 0;
});
```

## Test suites
Use `suite` to group your tests.

```motoko
import {test; suite} "mo:test";

suite("my test suite", func() {
    test("simple test", func() {
        assert true;
    });

    test("test my number", func() {
        assert 1 > 0;
    });
});
```

## Skip test
Use `skip` to skip tests.

```motoko
import {test; skip} "mo:test";

skip("this test will never run", func() {
    assert false;
});

test("this test will run", func() {
    assert true;
});
```

## Async tests
If there are `await`s in your tests, use functions from `mo:test/async`.

```motoko
import {test; suite} "mo:test/async";

await suite("my async test suite", func() : async () {
    await test("async test", func() : async () {
        let res = await myAsyncFn();
        assert Result.isOk(res);
    });

    test("should generate unique values", func() : async () {
        let a = await generate();
        let b = await generate();
        assert a != b;
    });
});
```

## Tests with `<system>` capability
Use `testsys` to run tests with `system` capability.

```motoko
import {testsys} "mo:test";

testsys<system>("test", func<system>() {
    myFunc<system>();
});
```

# Expect

```motoko
import {test; expect} "mo:test";
```

Expect consists of a number of "matchers" that let you validate different things.

Compared to `assert`, in case of fail `expect` shows you the details of the values.

For example `assert`:
```motoko
assert myNat == 1;
// execution error, assertion failure
```
We only know that `myNat` is not equal to `1`, but what is the actual value of `myNat`?
To know this, we have to add a new line `Debug.print(debug_show(myNat))`.

but with `expect`:
```motoko
expect.nat(myNat).equal(1);
// execution error, explicit trap:
// ! received 22
// ! expected 1
```
here we see the actual value of `myNat`


## `expect.nat` (nat8, nat16, nat32, nat64, int, int8, int16, int32, int64)

```motoko
import {test; expect} "mo:test";

expect.nat(x).equal(10); // x == 10
expect.nat(x).notEqual(10); // x != 10
expect.nat(x).less(10); // x < 10
expect.nat(x).lessOrEqual(10); // x <= 10
expect.nat(x).greater(10); // x > 10
expect.nat(x).greaterOrEqual(10); // x >= 10

expect.int(x).equal(10); // x == 10 (Int)
expect.int64(x).equal(10); // x == 10 (Int64)
expect.nat32(x).equal(10); // x == 10 (Nat32)
```

## `expect.char`

```motoko
expect.char(c).equal('a'); // c == 'a'
expect.char(c).notEqual('a'); // c != 'a'
expect.char(c).less('a'); // c < 'a'
expect.char(c).lessOrEqual('a'); // c <= 'a'
expect.char(c).greater('a'); // c > 'a'
expect.char(c).greaterOrEqual('a'); // c >= 'a'
```

## `expect.text`

```motoko
expect.text(foo).equal("bar"); // foo == "bar"
expect.text(foo).notEqual("bar"); // foo != "bar"
expect.text(foo).contains("bar"); // Text.contains(foo, #text("bar"))
expect.text(foo).startsWith("bar"); // Text.startsWith(foo, #text("bar"))
expect.text(foo).endsWith("bar"); // Text.endsWith(foo, #text("bar"))"

expect.text(foo).less("bar"); // foo < "bar"
expect.text(foo).lessOrEqual("bar"); // foo <= "bar"
expect.text(foo).greater("bar"); // foo > "bar"
expect.text(foo).greaterOrEqual("bar"); // foo >= "bar"
```

## `expect.option`

```motoko
// optional Nat
let optNat = ?10;
expect.option(optNat, Nat.toText, Nat.equal).equal(?10); // optNat == ?10
expect.option(optNat, Nat.toText, Nat.equal).notEqual(?25); // optNat != ?25
expect.option(optNat, Nat.toText, Nat.equal).isNull(); // optNat == null


// optional custom type
type MyType = {
    x : Nat;
    y : Nat;
};

func showMyType(a : MyType) : Text {
    debug_show(a);
};

func equalMyType(a : MyType, b : MyType) : Bool {
    a.x == b.x and a.y == b.y
};

let val = ?{x = 1; y = 2};

expect.option(val, showMyType, equalMyType).notEqual(null);
expect.option(val, showMyType, equalMyType).isSome(); // != null
expect.option(val, showMyType, equalMyType).equal(?{x = 1; y = 2});
```

## `expect.result`

```motoko
type MyRes = Result.Result<Nat, Text>;

func show(a) = debug_show(a);
func equal(a, b) = a == b

let ok : MyRes = #ok(22);
let err : MyRes = #err("error");

expect.result<Nat, Text>(ok, show, equal).isOk();
expect.result<Nat, Text>(ok, show, equal).equal(#ok(22));

expect.result<Nat, Text>(err, show, equal).isErr();
expect.result<Nat, Text>(err, show, equal).equal(#err("error"));
expect.result<Nat, Text>(err, show, equal).equal(#err("other error"));
```

## `expect.principal`

```motoko
expect.principal(id).isAnonymous(); // Principal.isAnonymous(id)
expect.principal(id).notAnonymous(); // not Principal.isAnonymous(id)

expect.principal(id).equal(id2); // id == id2
expect.principal(id).notEqual(id2); // id != id2

expect.principal(id).less(id2); // id < id2
expect.principal(id).lessOrEqual(id2); // id <= id2
expect.principal(id).greater(id2); // id > id2
expect.principal(id).greaterOrEqual(id2); // id >= id2
```

## `expect.bool`
```motoko
expect.bool(x).isTrue(); // a == true
expect.bool(x).isFalse(); // a == false
expect.bool(x).equal(b); // a == b
expect.bool(x).notEqual(b); // a != b
```

## `expect.array`
```motoko
expect.array([1,2,3], Nat.toText, Nat.equal).equal([1,2,3]);
expect.array([1,2,3], Nat.toText, Nat.equal).notEqual([1,2]);

expect.array([1,2,3], Nat.toText, Nat.equal).contains(3); // array contains element 3
expect.array([1,2,3], Nat.toText, Nat.equal).notContains(10); // array does not contain element 10

expect.array([1,2,3,4], Nat.toText, Nat.equal).size(4);
```

## `expect.blob`
```motoko
expect.blob(blob).size(4); // blob.size() == 4
expect.blob(blob).equal(blob2); // blob == blob2
expect.blob(blob).notEqual(blob2); // blob != blob2

expect.blob(blob).less(blob2); // blob < blob2
expect.blob(blob).lessOrEqual(blob2); // blob <= blob2
expect.blob(blob).greater(blob2); // blob > blob2
expect.blob(blob).greaterOrEqual(blob2); // blob >= blob2
```

## `expect.call`

_Does not catch traps._

```motoko
func myFunc() : async () {
    throw Error.reject("error");
};

func noop() : async () {
    // do not throw an error
};

await expect.call(myFunc).reject(); // ok
await expect.call(noop).reject(); // fail
```