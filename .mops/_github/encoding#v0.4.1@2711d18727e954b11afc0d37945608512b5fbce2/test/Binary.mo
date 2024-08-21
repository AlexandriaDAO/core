import { BigEndian; LittleEndian } "../src/Binary";

let n : Nat64 = 1_000_000_000_000;

let n_be = BigEndian.fromNat64(n);
assert(n == BigEndian.toNat64(n_be));

let n_le = LittleEndian.fromNat64(n);
assert(n == LittleEndian.toNat64(n_le));
