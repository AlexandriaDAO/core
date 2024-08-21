import { equal } = "mo:base-0.7.3/Nat";

import { contains; drop; slice; split; take } = "../src/Array";

let xs : [Nat] = [1, 2, 3];
for (x in xs.vals()) {
    assert(contains<Nat>(xs, x, equal));
    assert(not contains<Nat>(xs, x + 3, equal));
};

assert(drop<Nat>(xs, 0) == xs);
assert(drop<Nat>(xs, 1) == [2, 3]);
assert(drop<Nat>(xs, 2) == [3]);
assert(drop<Nat>(xs, 3) == []);
assert(drop<Nat>(xs, 9) == []);

assert(take<Nat>(xs, 0) == []);
assert(take<Nat>(xs, 1) == [1]);
assert(take<Nat>(xs, 2) == [1, 2]);
assert(take<Nat>(xs, 3) == xs);
assert(take<Nat>(xs, 9) == xs);

assert(split<Nat>(xs, 0) == (xs, []));
assert(split<Nat>(xs, 1) == ([1], [2, 3]));
assert(split<Nat>(xs, 2) == ([1, 2], [3]));
assert(split<Nat>(xs, 3) == ([], xs));
assert(split<Nat>(xs, 9) == ([], xs));

assert(slice<Nat>(xs, 0, 0) == [1]);
assert(slice<Nat>(xs, 1, 0) == []);
assert(slice<Nat>(xs, 0, 3) == xs);
