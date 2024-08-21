import { freeze; init } = "mo:base-0.7.3/Array";
import { range; toArray } = "mo:base-0.7.3/Iter";

import { copy; copyOffset; copyOffsetVar } = "../src/Copy";

let n = init<Nat>(10, 0);
let m = toArray(range(0, 9));

copy(n, m);
assert(freeze(n) == m);

// copy(n[5:], m)
copyOffset(n, 5, m, 0);
assert(freeze(n) == [0, 1, 2, 3, 4, 0, 1, 2, 3, 4]);

// copy(n[6:], n)
copyOffsetVar(n, 6, n, 0);
assert(freeze(n) == [0, 1, 2, 3, 4, 0, 0, 1, 2, 3]);
