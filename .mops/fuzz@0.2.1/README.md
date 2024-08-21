# Motoko fuzzing library

## Install
```
mops add fuzz
```

## Import
```motoko
import Fuzz "mo:fuzz";
```

## Initialize
Default (uses `Time.now()` as a seed)
```motoko
let fuzz = Fuzz.Fuzz();
```

or init from seed
```motoko
let seed = 123456789;
let fuzz = Fuzz.fromSeed(seed);
```

or init from a random blob
```motoko
let blob = await Random.blob();
let fuzz = Fuzz.fromBlob(blob);
```

or provide a function that generates a random Nat
```motoko
type Generator = {
	next() : Nat;
}
let fuzz = Fuzz.create(generator);
```

## Usage

### Numbers
*Nat, Nat8, Nat16, Nat32, Nat64, Int, Int8, Int16, Int32, Int64, Float*

Generate a random number
```motoko
let randNat = fuzz.nat.random();
let randNat32 = fuzz.nat32.random();
let randInt16 = fuzz.int16.random();
let randFloat = fuzz.float.random();
```

Generate a random number in the range (both bounds inclusive)
```motoko
let randNat = fuzz.nat.randomRange(2**128, 2**256);
let randNat32 = fuzz.nat32.randomRange(1_100, 10_000);
let randInt16 = fuzz.int16.randomRange(8, 99);
let randFloat = fuzz.float.randomRange(0.5, 10.88);
```

Get min/max value for the type
```motoko
let nat16Min = fuzz.nat.min();
let int32Min = fuzz.int32.min();
let int32Max = fuzz.int32.max();
```

### Array

Generate a random array of size 1000 with random values of Nat8
```motoko
let arrayNat8 = fuzz.array.randomArray(1000, fuzz.nat8.random);
```

Generate a random array of size 500 with custom type values
```motoko
type MyType = {
	x : Nat;
	b : Bool;
};
let randArray = fuzz.array.randomArray<MyType>(500, func() {
	return {
		x = fuzz.nat.random();
		b = fuzz.bool.random();
	};
});
```

Get random value from array
```motoko
let myArr = [1,2,4,4,4,55,1,2];

let item = fuzz.array.randomValue(myArr);
// or
let (index, item) = fuzz.array.randomEntry(myArr);
```

### Blob
Generate a random blob of size 1024
```motoko
let randBlob = fuzz.blob.randomBlob(1024);
```

### Bool
Generate a random bool value
```motoko
let randBool = fuzz.bool.random();
```

### Option
Randomly wrap option
```motoko
let myVal = { x = 3 };
let randOpt = fuzz.option.optOrNot(myVal); // => either ?{ x = 3 } or null
```

### Char
Return a random alphabetic char (`[a-zA-Z]`)
```motoko
let char = fuzz.char.randomAlphabetic();
```

Return a random alphanumeric char (`[a-zA-Z0-9]`)
```motoko
let char = fuzz.char.randomAlphanumeric();
```

Return a random ascii char (```[a-zA-Z0-9!"#$%&'()*+,-./,':;<=>?[\]^_`{|}~]```)
```motoko
let char = fuzz.char.randomAscii();
```

Return a random char from a given set
```motoko
let char = fuzz.char.randomUnicode(['a', 'b', '%', '.', ',', '0', '1']);
```

### Text
Return random text of given size
```motoko
let text = fuzz.text.randomText(17); // => "Lorem ipsum dolor"
let text = fuzz.text.randomText(8); // => "Lorem ip"
```

Return random alphabetic text of given size (`[a-zA-Z]`)
```motoko
let text = fuzz.text.randomAlphabetic(5); // => "aadkd"
let text = fuzz.text.randomAlphabetic(5); // => "kfiky"
```

Return random alphanumeric text of given size (`[a-zA-Z0-9]`)
```motoko
let text = fuzz.text.randomAlphanumeric(3); // => "po8"
let text = fuzz.text.randomAlphanumeric(3); // => "68r"
```

Return random ascii text of given size (```[a-zA-Z0-9!"#$%&'()*+,-./,':;<=>?[\]^_`{|}~]```)
```motoko
let text = fuzz.text.randomAscii(2); // => "t@"
let text = fuzz.text.randomAscii(2); // => "pl"
```

### Principal
Generate a random `Principal` of a given blob size
```motoko
let principal = fuzz.principal.randomPrincipal(10);
Principal.toText(principal); // => "4u4hq-3aaae-bagaz-jaeba-kaq"
```

### ICRC1
Generate random ICRC1 account
```motoko
type Account = {
	owner: Principal;
	subaccount: ?Blob;
};
let account: Account = fuzz.icrc1.randomAccount();
// or just
let account2 = fuzz.icrc1.randomAccount();
```

Generate random ICRC1 subaccount
```motoko
let subaccount: Blob = fuzz.icrc1.randomSubaccount();
```