import { StdEncoding; URLEncoding } = "../src/Base64";
import util "util";

assert(
    StdEncoding.encode([102, 111, 111, 32, 98, 97, 114])
    == [90, 109, 57, 118, 73, 71, 74, 104, 99, 103]
); // "foo bar"

assert(
    URLEncoding.decode([90, 109, 57, 118, 73, 71, 74, 104, 99, 103])
    == #ok([102, 111, 111, 32, 98, 97, 114])
); // "foo bar"

type TestPair = {
	decoded : Text;
    encoded : Text;
};

let pairs : [TestPair] = [
	{ decoded = ""; encoded = "" },
	{ decoded = "f"; encoded = "Zg" },
	{ decoded = "fo"; encoded = "Zm8" },
	{ decoded = "foo"; encoded = "Zm9v" },
	{ decoded = "foob"; encoded = "Zm9vYg" },
	{ decoded = "fooba"; encoded = "Zm9vYmE" },
	{ decoded = "foobar"; encoded = "Zm9vYmFy" },
];

for (pair in pairs.vals()) {
    let d = util.textToArray(pair.decoded);
    let e = util.textToArray(pair.encoded);

    assert(StdEncoding.encode(d) == e);
    assert(StdEncoding.decode(e) == #ok(d));

    assert(URLEncoding.encode(d) == e);
    assert(URLEncoding.decode(e) == #ok(d));
};
