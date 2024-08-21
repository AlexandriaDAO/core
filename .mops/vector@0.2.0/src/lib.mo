/// Resizable array with `O(sqrt(n))` memory overhead.
/// Static type `Vector` that can be declared `stable`.
/// For the `Vector` class see the file Class.mo.
///
/// The functions are modeled with respect to naming and semantics after their
/// counterparts for `Buffer` in motoko-base.
///
/// Copyright: 2023 MR Research AG
/// Main author: Andrii Stepanov
/// Contributors: Timo Hanke (timohanke), Andy Gura (andygura), react0r-com

import Prim "mo:⛔";
import { bitcountLeadingZero = leadingZeros; fromNat = Nat32; toNat = Nat } "mo:base/Nat32";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import { min = natMin; compare = natCompare } "mo:base/Nat";
import Order "mo:base/Order";
import Option "mo:base/Option";

module {
  /// Class `Vector<X>` provides a mutable list of elements of type `X`.
  /// It is a substitution for `Buffer<X>` with `O(sqrt(n))` memory waste instead of `O(size)` where
  /// n is the size of the data strucuture.
  /// Based on the paper "Resizable Arrays in Optimal Time and Space" by Brodnik, Carlsson, Demaine, Munro and Sedgewick (1999).
  /// Since this is internally a two-dimensional array the access times for put and get operations
  /// will naturally be 2x slower than Buffer and Array. However, Array is not resizable and Buffer
  /// has `O(size)` memory waste.
  public type Vector<X> = {
    /// the index block
    var data_blocks : [var [var ?X]];
    /// new element should be assigned to exaclty data_blocks[i_block][i_element]
    /// i_block is in range (0; data_blocks.size()]
    var i_block : Nat;
    /// i_element is in range [0; data_blocks[i_block].size())
    var i_element : Nat;
  };

  let INTERNAL_ERROR = "Internal error in Vector";

  /// Creates a new empty Vector for elements of type X.
  ///
  /// Example:
  /// ```motoko
  ///
  /// let vec = Vector.new<Nat>(); // Creates a new Vector
  /// ```
  public func new<X>() : Vector<X> = {
    var data_blocks = [var [var]];
    var i_block = 1;
    var i_element = 0;
  };

  /// Create a Vector with `size` copies of the initial value.
  ///
  /// ```
  /// let vec = Vector.init<Nat>(4, 2); // [2, 2, 2, 2]
  /// ```
  ///
  /// Runtime: `O(size)`
  public func init<X>(size : Nat, initValue : X) : Vector<X> {
    let (i_block, i_element) = locate(size);

    let blocks = new_index_block_length(Nat32(if (i_element == 0) { i_block - 1 } else i_block));
    let data_blocks = Array.init<[var ?X]>(blocks, [var]);
    var i = 1;
    while (i < i_block) {
      data_blocks[i] := Array.init<?X>(data_block_size(i), ?initValue);
      i += 1;
    };
    if (i_element != 0 and i_block < blocks) {
      let block = Array.init<?X>(data_block_size(i), null);
      var j = 0;
      while (j < i_element) {
        block[j] := ?initValue;
        j += 1;
      };
      data_blocks[i] := block;
    };

    {
      var data_blocks = data_blocks;
      var i_block = i_block;
      var i_element = i_element;
    };
  };

  /// Add to vector `count` copies of the initial value.
  ///
  /// ```
  /// let vec = Vector.init<Nat>(4, 2); // [2, 2, 2, 2]
  /// Vector.addMany(vec, 2, 1); // [2, 2, 2, 2, 1, 1]
  /// ```
  ///
  /// Runtime: `O(count)`
  public func addMany<X>(vec : Vector<X>, count : Nat, initValue : X) {
    let (i_block, i_element) = locate(size(vec) + count);
    let blocks = new_index_block_length(Nat32(if (i_element == 0) { i_block - 1 } else i_block));

    let old_blocks = vec.data_blocks.size();
    if (old_blocks < blocks) {
      let old_data_blocks = vec.data_blocks;
      vec.data_blocks := Array.init<[var ?X]>(blocks, [var]);
      var i = 0;
      while (i < old_blocks) {
        vec.data_blocks[i] := old_data_blocks[i];
        i += 1;
      };
    };

    var cnt = count;
    while (cnt > 0) {
      let db_size = data_block_size(vec.i_block);
      if (vec.i_element == 0 and db_size <= cnt) {
        vec.data_blocks[vec.i_block] := Array.init<?X>(db_size, ?initValue);
        cnt -= db_size;
        vec.i_block += 1;
      } else {
        if (vec.data_blocks[vec.i_block].size() == 0) {
          vec.data_blocks[vec.i_block] := Array.init<?X>(db_size, null);
        };
        let from = vec.i_element;
        let to = natMin(vec.i_element + cnt, db_size);

        let block = vec.data_blocks[vec.i_block];
        var i = from;
        while (i < to) {
          block[i] := ?initValue;
          i += 1;
        };

        vec.i_element := to;
        if (vec.i_element == db_size) {
          vec.i_element := 0;
          vec.i_block += 1;
        };
        cnt -= to - from;
      };
    };
  };

  /// Resets the vector to size 0, de-referencing all elements.
  ///
  /// Example:
  /// ```motoko
  ///
  /// Vector.add(vec, 10);
  /// Vector.add(vec, 11);
  /// Vector.add(vec, 12);
  /// Vector.clear(vec); // vector is now empty
  /// Vector.toArray(vec) // => []
  /// ```
  ///
  /// Runtime: `O(1)`
  public func clear<X>(vec : Vector<X>) {
    vec.data_blocks := [var [var]];
    vec.i_block := 1;
    vec.i_element := 0;
  };

  /// Returns a copy of a Vector, with the same size.
  ///
  /// Example:
  /// ```motoko
  ///
  /// vec.add(1);
  ///
  /// let clone = Vector.clone(vec);
  /// Vector.toArray(clone); // => [1]
  /// ```
  ///
  /// Runtime: `O(size)`
  public func clone<X>(vec : Vector<X>) : Vector<X> = {
    var data_blocks = Array.tabulateVar<[var ?X]>(
      vec.data_blocks.size(),
      func(i) = Array.tabulateVar<?X>(
        vec.data_blocks[i].size(),
        func(j) = vec.data_blocks[i][j],
      ),
    );
    var i_block = vec.i_block;
    var i_element = vec.i_element;
  };

  /// Creates and returns a new vector, populated with the results of calling a provided function on every element in the provided vector
  ///
  /// Example:
  /// ```motoko
  ///
  /// vec.add(1);
  ///
  /// let t = Vector.map<Nat, Text>(vec, Nat.toText);
  /// Vector.toArray(t); // => ["1"]
  /// ```
  ///
  /// Runtime: `O(size)`
  public func map<X1, X2>(vec : Vector<X1>, f : X1 -> X2) : Vector<X2> = {
    var data_blocks = Array.tabulateVar<[var ?X2]>(
      vec.data_blocks.size(),
      func(i) {
        let db = vec.data_blocks[i];
        Array.tabulateVar<?X2>(
          db.size(),
          func(j) = switch (db[j]) {
            case (?item) ?f(item);
            case (null) null;
          },
        );
      },
    );
    var i_block = vec.i_block;
    var i_element = vec.i_element;
  };

  /// Returns the current number of elements in the vector.
  ///
  /// Example:
  /// ```motoko
  ///
  /// Vector.size(vec) // => 0
  /// ```
  ///
  /// Runtime: `O(1)` (with some internal calculations)
  public func size<X>(vec : Vector<X>) : Nat {
    let d = Nat32(vec.i_block);
    let i = Nat32(vec.i_element);

    // We call all data blocks of the same capacity an "epoch". We number the epochs 0,1,2,...
    // A data block is in epoch e iff the data block has capacity 2 ** e.
    // Each epoch starting with epoch 1 spans exactly two super blocks.
    // Super block s falls in epoch ceil(s/2).

    // epoch of last data block
    // e = 32 - lz
    let lz = leadingZeros(d / 3);

    // capacity of all prior epochs combined
    // capacity_before_e = 2 * 4 ** (e - 1) - 1

    // data blocks in all prior epochs combined
    // blocks_before_e = 3 * 2 ** (e - 1) - 2

    // then size = d * 2 ** e + i - c
    // where c = blocks_before_e * 2 ** e - capacity_before_e

    // there can be overflows, but the result is without overflows, so use addWrap and subWrap
    // we don't erase bits by >>, so to use <>> is ok
    Nat((d -% (1 <>> lz)) <>> lz +% i);
  };

  func data_block_size(i_block : Nat) : Nat {
    // formula for the size of given i_block
    // don't call it for i_block == 0
    Nat(1 <>> leadingZeros(Nat32(i_block) / 3));
  };

  func new_index_block_length(i_block : Nat32) : Nat {
    if (i_block <= 1) 2 else {
      let s = 30 - leadingZeros(i_block);
      Nat(((i_block >> s) +% 1) << s);
    };
  };

  func grow_index_block_if_needed<X>(vec : Vector<X>) {
    if (vec.data_blocks.size() == vec.i_block) {
      let new_blocks = Array.init<[var ?X]>(new_index_block_length(Nat32(vec.i_block)), [var]);
      var i = 0;
      while (i < vec.i_block) {
        new_blocks[i] := vec.data_blocks[i];
        i += 1;
      };
      vec.data_blocks := new_blocks;
    };
  };

  func shrink_index_block_if_needed<X>(vec : Vector<X>) {
    let i_block = Nat32(vec.i_block);
    // kind of index of the first block in the super block
    if ((i_block << leadingZeros(i_block)) << 2 == 0) {
      let new_length = new_index_block_length(i_block);
      if (new_length < vec.data_blocks.size()) {
        let new_blocks = Array.init<[var ?X]>(new_length, [var]);
        var i = 0;
        while (i < new_length) {
          new_blocks[i] := vec.data_blocks[i];
          i += 1;
        };
        vec.data_blocks := new_blocks;
      };
    };
  };

  /// Adds a single element to the end of a Vector,
  /// allocating a new internal data block if needed,
  /// and resizing the internal index block if needed.
  ///
  /// Example:
  /// ```motoko
  ///
  /// Vector.add(vec, 0); // add 0 to vector
  /// Vector.add(vec, 1);
  /// Vector.add(vec, 2);
  /// Vector.add(vec, 3);
  /// Vector.toArray(vec) // => [0, 1, 2, 3]
  /// ```
  ///
  /// Amortized Runtime: `O(1)`, Worst Case Runtime: `O(sqrt(n))`
  public func add<X>(vec : Vector<X>, element : X) {
    var i_element = vec.i_element;
    if (i_element == 0) {
      grow_index_block_if_needed(vec);
      let i_block = vec.i_block;

      // When removing last we keep one more data block, so can be not empty
      if (vec.data_blocks[i_block].size() == 0) {
        vec.data_blocks[i_block] := Array.init<?X>(
          data_block_size(i_block),
          null,
        );
      };
    };

    let last_data_block = vec.data_blocks[vec.i_block];

    last_data_block[i_element] := ?element;

    i_element += 1;
    if (i_element == last_data_block.size()) {
      i_element := 0;
      vec.i_block += 1;
    };
    vec.i_element := i_element;
  };

  /// Removes and returns the last item in the vector or `null` if
  /// the vector is empty.
  ///
  /// Example:
  /// ```motoko
  ///
  /// Vector.add(vec, 10);
  /// Vector.add(vec, 11);
  /// Vector.removeLast(vec); // => ?11
  /// ```
  ///
  /// Amortized Runtime: `O(1)`, Worst Case Runtime: `O(sqrt(n))`
  ///
  /// Amortized Space: `O(1)`, Worst Case Space: `O(sqrt(n))`
  public func removeLast<X>(vec : Vector<X>) : ?X {
    var i_element = vec.i_element;
    if (i_element == 0) {
      shrink_index_block_if_needed(vec);

      var i_block = vec.i_block;
      if (i_block == 0) {
        return null;
      };
      i_block -= 1;
      i_element := vec.data_blocks[i_block].size();

      // Keep one totally empty block when removing
      if (i_block + 2 < vec.data_blocks.size()) {
        if (vec.data_blocks[i_block + 2].size() == 0) {
          vec.data_blocks[i_block + 2] := [var];
        };
      };
      vec.i_block := i_block;
    };
    i_element -= 1;

    var last_data_block = vec.data_blocks[vec.i_block];

    let element = last_data_block[i_element];
    last_data_block[i_element] := null;

    vec.i_element := i_element;
    return element;
  };

  func locate(index : Nat) : (Nat, Nat) {
    // see comments in tests
    let i = Nat32(index);
    let lz = leadingZeros(i);
    let lz2 = lz >> 1;
    if (lz & 1 == 0) {
      (Nat(((i << lz2) >> 16) ^ (0x10000 >> lz2)), Nat(i & (0xFFFF >> lz2)));
    } else {
      (Nat(((i << lz2) >> 15) ^ (0x18000 >> lz2)), Nat(i & (0x7FFF >> lz2)));
    };
  };

  /// Returns the element at index `index`. Indexing is zero-based.
  /// Traps if `index >= size`, error message may not be descriptive.
  ///
  /// Example:
  /// ```motoko
  ///
  /// Vector.add(vec, 10);
  /// Vector.add(vec, 11);
  /// Vector.get(vec, 0); // => 10
  /// ```
  ///
  /// Runtime: `O(1)`
  public func get<X>(vec : Vector<X>, index : Nat) : X {
    // inlined version of:
    //   let (a,b) = locate(index);
    //   switch(vec.data_blocks[a][b]) {
    //     case (?element) element;
    //     case (null) Prim.trap "";
    //   };
    let i = Nat32(index);
    let lz = leadingZeros(i);
    let lz2 = lz >> 1;
    switch (
      if (lz & 1 == 0) {
        vec.data_blocks[Nat(((i << lz2) >> 16) ^ (0x10000 >> lz2))][Nat(i & (0xFFFF >> lz2))];
      } else {
        vec.data_blocks[Nat(((i << lz2) >> 15) ^ (0x18000 >> lz2))][Nat(i & (0x7FFF >> lz2))];
      }
    ) {
      case (?result) return result;
      case (_) Prim.trap "Vector index out of bounds in get";
    };
  };

  /// Returns the element at index `index` as an option.
  /// Returns `null` when `index >= size`. Indexing is zero-based.
  ///
  /// Example:
  /// ```motoko
  ///
  /// Vector.add(vec, 10);
  /// Vector.add(vec, 11);
  /// let x = Vector.getOpt(vec, 0); // => ?10
  /// let y = Vector.getOpt(vec, 2); // => null
  /// ```
  ///
  /// Runtime: `O(1)`
  public func getOpt<X>(vec : Vector<X>, index : Nat) : ?X {
    let (a, b) = locate(index);
    if (a < vec.i_block or vec.i_element != 0 and a == vec.i_block) {
      vec.data_blocks[a][b];
    } else {
      null;
    };
  };

  /// Overwrites the current element at `index` with `element`. Traps if
  /// `index` >= size. Indexing is zero-based.
  ///
  /// Example:
  /// ```motoko
  ///
  /// Vector.add(vec, 10);
  /// Vector.put(vec, 0, 20); // overwrites 10 at index 0 with 20
  /// Vector.toArray(vec) // => [20]
  /// ```
  ///
  /// Runtime: `O(1)`
  public func put<X>(vec : Vector<X>, index : Nat, value : X) {
    let (a, b) = locate(index);
    if (a < vec.i_block or a == vec.i_block and b < vec.i_element) {
      vec.data_blocks[a][b] := ?value;
    } else Prim.trap "Vector index out of bounds in put";
  };

  /// Finds the first index of `element` in `vec` using equality of elements defined
  /// by `equal`. Returns `null` if `element` is not found.
  ///
  /// Example:
  /// ```motoko
  ///
  /// let vec = Vector.new<Nat>();
  /// Vector.add(vec, 1);
  /// Vector.add(vec, 2);
  /// Vector.add(vec, 3);
  /// Vector.add(vec, 4);
  ///
  /// Vector.indexOf<Nat>(3, vec, Nat.equal); // => ?2
  /// ```
  ///
  /// Runtime: `O(size)`
  ///
  /// *Runtime and space assumes that `equal` runs in `O(1)` time and space.
  public func indexOf<X>(element : X, vec : Vector<X>, equal : (X, X) -> Bool) : ?Nat {
    // inlining would save 10 instructions per entry
    firstIndexWith<X>(vec, func(x) = equal(element, x));
  };

  /// Finds the last index of `element` in `vec` using equality of elements defined
  /// by `equal`. Returns `null` if `element` is not found.
  ///
  /// Example:
  /// ```motoko
  ///
  /// let vec = Vector.new<Nat>();
  /// Vector.add(vec, 1);
  /// Vector.add(vec, 2);
  /// Vector.add(vec, 3);
  /// Vector.add(vec, 4);
  /// Vector.add(vec, 2);
  /// Vector.add(vec, 2);
  ///
  /// Vector.lastIndexOf<Nat>(2, vec, Nat.equal); // => ?5
  /// ```
  ///
  /// Runtime: `O(size)`
  ///
  /// *Runtime and space assumes that `equal` runs in `O(1)` time and space.
  public func lastIndexOf<X>(element : X, vec : Vector<X>, equal : (X, X) -> Bool) : ?Nat {
    // inlining would save 10 instructions per entry
    lastIndexWith<X>(vec, func(x) = equal(element, x));
  };

  /// Finds the index of the first element in `vec` for which `predicate` is true.
  /// Returns `null` if no such element is found.
  ///
  /// Example:
  /// ```motoko
  ///
  /// let vec = Vector.new<Nat>();
  /// Vector.add(vec, 1);
  /// Vector.add(vec, 2);
  /// Vector.add(vec, 3);
  /// Vector.add(vec, 4);
  ///
  /// Vector.firstIndexWith<Nat>(vec, func(i) { i % 2 == 0 }); // => ?1
  /// ```
  ///
  /// Runtime: `O(size)`
  ///
  /// *Runtime and space assumes that `predicate` runs in `O(1)` time and space.
  public func firstIndexWith<X>(vec : Vector<X>, predicate : X -> Bool) : ?Nat {
    let blocks = vec.data_blocks.size();
    var i_block = 0;
    var i_element = 0;
    var size = 0;
    var db : [var ?X] = [var];
    var i = 0;

    loop {
      if (i_element == size) {
        i_block += 1;
        if (i_block >= blocks) return null;
        db := vec.data_blocks[i_block];
        size := db.size();
        if (size == 0) return null;
        i_element := 0;
      };
      switch (db[i_element]) {
        case (?x) if (predicate(x)) return ?i;
        case (_) return null;
      };
      i_element += 1;
      i += 1;
    };
  };

  /// Finds the index of the last element in `vec` for which `predicate` is true.
  /// Returns `null` if no such element is found.
  ///
  /// Example:
  /// ```motoko
  ///
  /// let vec = Vector.new<Nat>();
  /// Vector.add(vec, 1);
  /// Vector.add(vec, 2);
  /// Vector.add(vec, 3);
  /// Vector.add(vec, 4);
  ///
  /// Vector.lastIndexWith<Nat>(vec, func(i) { i % 2 == 0 }); // => ?3
  /// ```
  ///
  /// Runtime: `O(size)`
  ///
  /// *Runtime and space assumes that `predicate` runs in `O(1)` time and space.
  public func lastIndexWith<X>(vec : Vector<X>, predicate : X -> Bool) : ?Nat {
    var i = size(vec);
    var i_block = vec.i_block;
    var i_element = vec.i_element;
    var db : [var ?X] = if (i_block < vec.data_blocks.size()) {
      vec.data_blocks[i_block];
    } else { [var] };

    loop {
      if (i_block == 1) {
        return null;
      };
      if (i_element == 0) {
        i_block -= 1;
        db := vec.data_blocks[i_block];
        i_element := db.size() - 1;
      } else {
        i_element -= 1;
      };
      switch (db[i_element]) {
        case (?x) {
          i -= 1;
          if (predicate(x)) return ?i;
        };
        case (_) Prim.trap(INTERNAL_ERROR);
      };
    };
  };

  /// Returns true iff every element in `vec` satisfies `predicate`.
  /// In particular, if `vec` is empty the function returns `true`.
  ///
  /// Example:
  /// ```motoko
  ///
  /// Vector.add(vec, 2);
  /// Vector.add(vec, 3);
  /// Vector.add(vec, 4);
  ///
  /// Vector.forAll<Nat>(vec, func x { x > 1 }); // => true
  /// ```
  ///
  /// Runtime: `O(size)`
  ///
  /// Space: `O(1)`
  ///
  /// *Runtime and space assumes that `predicate` runs in O(1) time and space.
  public func forAll<X>(vec : Vector<X>, predicate : X -> Bool) : Bool {
    not forSome<X>(vec, func(x) : Bool = not predicate(x));
  };

  /// Returns true iff some element in `vec` satisfies `predicate`.
  /// In particular, if `vec` is empty the function returns `false`.
  ///
  /// Example:
  /// ```motoko
  ///
  /// Vector.add(vec, 2);
  /// Vector.add(vec, 3);
  /// Vector.add(vec, 4);
  ///
  /// Vector.forSome<Nat>(vec, func x { x > 3 }); // => true
  /// ```
  ///
  /// Runtime: `O(size)`
  ///
  /// Space: `O(1)`
  ///
  /// *Runtime and space assumes that `predicate` runs in O(1) time and space.
  public func forSome<X>(vec : Vector<X>, predicate : X -> Bool) : Bool {
    switch (firstIndexWith(vec, predicate)) {
      case (null) false;
      case (_) true;
    };
  };

  /// Returns true iff no element in `vec` satisfies `predicate`.
  /// This is logically equivalent to that all elements in `vec` satisfy `not predicate`.
  /// In particular, if `vec` is empty the function returns `true`.
  ///
  /// Example:
  /// ```motoko
  ///
  /// Vector.add(vec, 2);
  /// Vector.add(vec, 3);
  /// Vector.add(vec, 4);
  ///
  /// Vector.forNone<Nat>(vec, func x { x == 0 }); // => true
  /// ```
  ///
  /// Runtime: `O(size)`
  ///
  /// Space: `O(1)`
  ///
  /// *Runtime and space assumes that `predicate` runs in O(1) time and space.
  public func forNone<X>(vec : Vector<X>, predicate : X -> Bool) : Bool = not forSome(vec, predicate);

  /// Returns an Iterator (`Iter`) over the elements of a Vector.
  /// Iterator provides a single method `next()`, which returns
  /// elements in order, or `null` when out of elements to iterate over.
  ///
  /// ```
  ///
  /// Vector.add(vec, 10);
  /// Vector.add(vec, 11);
  /// Vector.add(vec, 12);
  ///
  /// var sum = 0;
  /// for (element in Vector.vals(vec)) {
  ///   sum += element;
  /// };
  /// sum // => 33
  /// ```
  ///
  /// Note: This does not create a snapshot. If the returned iterator is not consumed at once,
  /// and instead the consumption of the iterator is interleaved with other operations on the
  /// Vector, then this may lead to unexpected results.
  ///
  /// Runtime: `O(1)`
  public func vals<X>(vec : Vector<X>) : Iter.Iter<X> = vals_(vec);

  /// Returns an Iterator (`Iter`) over the items, i.e. pairs of value and index of a Vector.
  /// Iterator provides a single method `next()`, which returns
  /// elements in order, or `null` when out of elements to iterate over.
  ///
  /// ```
  ///
  /// Vector.add(vec, 10);
  /// Vector.add(vec, 11);
  /// Vector.add(vec, 12);
  /// Iter.toArray(Vector.items(vec)); // [(10, 0), (11, 1), (12, 2)]
  /// ```
  ///
  /// Note: This does not create a snapshot. If the returned iterator is not consumed at once,
  /// and instead the consumption of the iterator is interleaved with other operations on the
  /// Vector, then this may lead to unexpected results.
  ///
  /// Runtime: `O(1)`
  ///
  /// Warning: Allocates memory on the heap to store ?(X, Nat).
  public func items<X>(vec : Vector<X>) : Iter.Iter<(X, Nat)> = object {
    let blocks = vec.data_blocks.size();
    var i_block = 0;
    var i_element = 0;
    var size = 0;
    var db : [var ?X] = [var];
    var i = 0;

    public func next() : ?(X, Nat) {
      if (i_element == size) {
        i_block += 1;
        if (i_block >= blocks) return null;
        db := vec.data_blocks[i_block];
        size := db.size();
        if (size == 0) return null;
        i_element := 0;
      };
      switch (db[i_element]) {
        case (?x) {
          let ret = ?(x, i);
          i_element += 1;
          i += 1;
          return ret;
        };
        case (_) return null;
      };
    };
  };

  /// Returns an Iterator (`Iter`) over the elements of a Vector in reverse order.
  /// Iterator provides a single method `next()`, which returns
  /// elements in reverse order, or `null` when out of elements to iterate over.
  ///
  /// ```
  ///
  /// Vector.add(vec, 10);
  /// Vector.add(vec, 11);
  /// Vector.add(vec, 12);
  ///
  /// var sum = 0;
  /// for (element in Vector.vals(vec)) {
  ///   sum += element;
  /// };
  /// sum // => 33
  /// ```
  ///
  /// Note: This does not create a snapshot. If the returned iterator is not consumed at once,
  /// and instead the consumption of the iterator is interleaved with other operations on the
  /// Vector, then this may lead to unexpected results.
  ///
  /// Runtime: `O(1)`
  public func valsRev<X>(vec : Vector<X>) : Iter.Iter<X> = object {
    var i_block = vec.i_block;
    var i_element = vec.i_element;
    var db : [var ?X] = if (i_block < vec.data_blocks.size()) {
      vec.data_blocks[i_block];
    } else { [var] };

    public func next() : ?X {
      if (i_block == 1) {
        return null;
      };
      if (i_element == 0) {
        i_block -= 1;
        db := vec.data_blocks[i_block];
        i_element := db.size() - 1;
      } else {
        i_element -= 1;
      };

      db[i_element];
    };
  };

  /// Returns an Iterator (`Iter`) over the items in reverse order, i.e. pairs of value and index of a Vector.
  /// Iterator provides a single method `next()`, which returns
  /// elements in reverse order, or `null` when out of elements to iterate over.
  ///
  /// ```
  ///
  /// Vector.add(vec, 10);
  /// Vector.add(vec, 11);
  /// Vector.add(vec, 12);
  /// Iter.toArray(Vector.items(vec)); // [(12, 0), (11, 1), (10, 2)]
  /// ```
  ///
  /// Note: This does not create a snapshot. If the returned iterator is not consumed at once,
  /// and instead the consumption of the iterator is interleaved with other operations on the
  /// Vector, then this may lead to unexpected results.
  ///
  /// Runtime: `O(1)`
  ///
  /// Warning: Allocates memory on the heap to store ?(X, Nat).
  public func itemsRev<X>(vec : Vector<X>) : Iter.Iter<(X, Nat)> = object {
    var i = size(vec);
    var i_block = vec.i_block;
    var i_element = vec.i_element;
    var db : [var ?X] = if (i_block < vec.data_blocks.size()) {
      vec.data_blocks[i_block];
    } else { [var] };

    public func next() : ?(X, Nat) {
      if (i_block == 1) {
        return null;
      };
      if (i_element == 0) {
        i_block -= 1;
        db := vec.data_blocks[i_block];
        i_element := db.size() - 1;
      } else {
        i_element -= 1;
      };
      switch (db[i_element]) {
        case (?x) {
          i -= 1;
          return ?(x, i);
        };
        case (_) Prim.trap(INTERNAL_ERROR);
      };
    };
  };

  /// Returns an Iterator (`Iter`) over the keys (indices) of a Vector.
  /// Iterator provides a single method `next()`, which returns
  /// elements in order, or `null` when out of elements to iterate over.
  ///
  /// ```
  ///
  /// Vector.add(vec, 10);
  /// Vector.add(vec, 11);
  /// Vector.add(vec, 12);
  /// Iter.toArray(Vector.items(vec)); // [0, 1, 2]
  /// ```
  ///
  /// Note: This does not create a snapshot. If the returned iterator is not consumed at once,
  /// and instead the consumption of the iterator is interleaved with other operations on the
  /// Vector, then this may lead to unexpected results.
  ///
  /// Runtime: `O(1)`
  public func keys<X>(vec : Vector<X>) : Iter.Iter<Nat> = Iter.range(0, size(vec) - 1);

  /// Creates a Vector containing elements from `iter`.
  ///
  /// Example:
  /// ```motoko
  ///
  /// import Nat "mo:base/Nat";
  ///
  /// let array = [1, 1, 1];
  /// let iter = array.vals();
  ///
  /// let vec = Vector.fromIter<Nat>(iter); // => [1, 1, 1]
  /// ```
  ///
  /// Runtime: `O(size)`
  public func fromIter<X>(iter : Iter.Iter<X>) : Vector<X> {
    let vec = new<X>();
    for (element in iter) add(vec, element);
    vec;
  };

  /// Adds elements to a Vector from `iter`.
  ///
  /// Example:
  /// ```motoko
  ///
  /// import Nat "mo:base/Nat";
  ///
  /// let array = [1, 1, 1];
  /// let iter = array.vals();
  /// let vec = Vector.init<Nat>(1, 2);
  ///
  /// let vec = Vector.addFromIter<Nat>(vec, iter); // => [2, 1, 1, 1]
  /// ```
  ///
  /// Runtime: `O(size)`, where n is the size of iter.
  public func addFromIter<X>(vec : Vector<X>, iter : Iter.Iter<X>) {
    for (element in iter) add(vec, element);
  };

  /// Creates an immutable array containing elements from a Vector.
  ///
  /// Example:
  /// ```motoko
  ///
  /// Vector.add(vec, 1);
  /// Vector.add(vec, 2);
  /// Vector.add(vec, 3);
  ///
  /// Vector.toArray<Nat>(vec); // => [1, 2, 3]
  ///
  /// ```
  ///
  /// Runtime: `O(size)`
  public func toArray<X>(vec : Vector<X>) : [X] = Array.tabulate<X>(size(vec), vals_(vec).unsafe_next_i);

  private func vals_<X>(vec : Vector<X>) : {
    next : () -> ?X;
    unsafe_next : () -> X;
    unsafe_next_i : Nat -> X;
  } = object {
    let blocks = vec.data_blocks.size();
    var i_block = 0;
    var i_element = 0;
    var db_size = 0;
    var db : [var ?X] = [var];

    public func next() : ?X {
      if (i_element == db_size) {
        i_block += 1;
        if (i_block >= blocks) return null;
        db := vec.data_blocks[i_block];
        db_size := db.size();
        if (db_size == 0) return null;
        i_element := 0;
      };
      switch (db[i_element]) {
        case (?x) {
          i_element += 1;
          return ?x;
        };
        case (_) return null;
      };
    };

    // version of next() without option type
    // inlined version of
    //   public func unsafe_next() : X = {
    //     let ?x = next() else Prim.trap(INTERNAL_ERROR);
    //     x;
    //   };
    public func unsafe_next() : X {
      if (i_element == db_size) {
        i_block += 1;
        if (i_block >= blocks) Prim.trap(INTERNAL_ERROR);
        db := vec.data_blocks[i_block];
        db_size := db.size();
        if (db_size == 0) Prim.trap(INTERNAL_ERROR);
        i_element := 0;
      };
      switch (db[i_element]) {
        case (?x) {
          i_element += 1;
          return x;
        };
        case (_) Prim.trap(INTERNAL_ERROR);
      };
    };

    // version of next() without option type and throw-away argument
    // inlined version of
    //   public func unsafe_next_(i : Nat) : X = unsafe_next();
    public func unsafe_next_i(i : Nat) : X {
      if (i_element == db_size) {
        i_block += 1;
        if (i_block >= blocks) Prim.trap(INTERNAL_ERROR);
        db := vec.data_blocks[i_block];
        db_size := db.size();
        if (db_size == 0) Prim.trap(INTERNAL_ERROR);
        i_element := 0;
      };
      switch (db[i_element]) {
        case (?x) {
          i_element += 1;
          return x;
        };
        case (_) Prim.trap(INTERNAL_ERROR);
      };
    };
  };

  /// Creates a Vector containing elements from an Array.
  ///
  /// Example:
  /// ```motoko
  ///
  /// import Nat "mo:base/Nat";
  ///
  /// let array = [2, 3];
  ///
  /// let vec = Vector.fromArray<Nat>(array); // => [2, 3]
  /// ```
  ///
  /// Runtime: `O(size)`
  public func fromArray<X>(array : [X]) : Vector<X> {
    let (i_block, i_element) = locate(array.size());

    let blocks = new_index_block_length(Nat32(if (i_element == 0) { i_block - 1 } else i_block));
    let data_blocks = Array.init<[var ?X]>(blocks, [var]);
    var i = 1;
    var pos = 0;

    func make_block(len : Nat, fill : Nat) : [var ?X] {
      let block = Array.init<?X>(len, null);
      var j = 0;
      while (j < fill) {
        block[j] := ?array[pos];
        j += 1;
        pos += 1;
      };
      block;
    };

    while (i < i_block) {
      let len = data_block_size(i);
      data_blocks[i] := make_block(len, len);
      i += 1;
    };
    if (i_element != 0 and i_block < blocks) {
      data_blocks[i] := make_block(data_block_size(i), i_element);
    };

    {
      var data_blocks = data_blocks;
      var i_block = i_block;
      var i_element = i_element;
    };

  };

  /// Creates a mutable Array containing elements from a Vector.
  ///
  /// Example:
  /// ```motoko
  ///
  /// Vector.add(vec, 1);
  /// Vector.add(vec, 2);
  /// Vector.add(vec, 3);
  ///
  /// Vector.toVarArray<Nat>(vec); // => [1, 2, 3]
  ///
  /// ```
  ///
  /// Runtime: `O(size)`
  public func toVarArray<X>(vec : Vector<X>) : [var X] {
    let s = size(vec);
    if (s == 0) return [var];
    let arr = Array.init<X>(s, first(vec));
    var i = 0;
    let next = vals_(vec).unsafe_next;
    while (i < s) {
      arr[i] := next();
      i += 1;
    };
    arr;
  };

  /// Creates a Vector containing elements from a mutable Array.
  ///
  /// Example:
  /// ```motoko
  ///
  /// import Nat "mo:base/Nat";
  ///
  /// let array = [var 2, 3];
  ///
  /// let vec = Vector.fromVarArray<Nat>(array); // => [2, 3]
  /// ```
  ///
  /// Runtime: `O(size)`
  public func fromVarArray<X>(array : [var X]) : Vector<X> {
    let (i_block, i_element) = locate(array.size());

    let blocks = new_index_block_length(Nat32(if (i_element == 0) { i_block - 1 } else i_block));
    let data_blocks = Array.init<[var ?X]>(blocks, [var]);
    var i = 1;
    var pos = 0;

    func make_block(len : Nat, fill : Nat) : [var ?X] {
      let block = Array.init<?X>(len, null);
      var j = 0;
      while (j < fill) {
        block[j] := ?array[pos];
        j += 1;
        pos += 1;
      };
      block;
    };

    while (i < i_block) {
      let len = data_block_size(i);
      data_blocks[i] := make_block(len, len);
      i += 1;
    };
    if (i_element != 0 and i_block < blocks) {
      data_blocks[i] := make_block(data_block_size(i), i_element);
    };

    {
      var data_blocks = data_blocks;
      var i_block = i_block;
      var i_element = i_element;
    };

  };

  /// Returns the first element of `vec`. Traps if `vec` is empty.
  ///
  /// Example:
  /// ```motoko
  ///
  /// let vec = Vector.init<Nat>(10, 1);
  ///
  /// Vector.first(vec); // => 1
  /// ```
  ///
  /// Runtime: `O(1)`
  ///
  /// Space: `O(1)`
  public func first<X>(vec : Vector<X>) : X {
    let ?x = vec.data_blocks[1][0] else Prim.trap "Vector index out of bounds in first";
    x;
  };

  /// Returns the last element of `vec`. Traps if `vec` is empty.
  ///
  /// Example:
  /// ```motoko
  ///
  /// let vec = Vector.fromArray<Nat>([1, 2, 3]);
  ///
  /// Vector.last(vec); // => 3
  /// ```
  ///
  /// Runtime: `O(1)`
  ///
  /// Space: `O(1)`
  public func last<X>(vec : Vector<X>) : X {
    let e = vec.i_element;
    if (e > 0) {
      let ?x = vec.data_blocks[vec.i_block][e - 1] else Prim.trap(INTERNAL_ERROR);
      return x;
    };
    let ?x = vec.data_blocks[vec.i_block - 1][0] else Prim.trap "Vector index out of bounds in first";
    return x;
  };

  /// Applies `f` to each element in `vec`.
  ///
  /// Example:
  /// ```motoko
  ///
  /// import Nat "mo:base/Nat";
  /// import Debug "mo:base/Debug";
  ///
  /// let vec = Vector.fromArray<Nat>([1, 2, 3]);
  ///
  /// Vector.iterate<Nat>(vec, func (x) {
  ///   Debug.print(Nat.toText(x)); // prints each element in vector
  /// });
  /// ```
  ///
  /// Runtime: `O(size)`
  ///
  /// Space: `O(size)`
  ///
  /// *Runtime and space assumes that `f` runs in O(1) time and space.
  public func iterate<X>(vec : Vector<X>, f : X -> ()) {
    let blocks = vec.data_blocks.size();
    var i_block = 0;
    var i_element = 0;
    var size = 0;
    var db : [var ?X] = [var];

    loop {
      if (i_element == size) {
        i_block += 1;
        if (i_block >= blocks) return;
        db := vec.data_blocks[i_block];
        size := db.size();
        if (size == 0) return;
        i_element := 0;
      };
      switch (db[i_element]) {
        case (?x) {
          f(x);
          i_element += 1;
        };
        case (_) return;
      };
    };
  };

  /// Applies `f` to each item `(i, x)` in `vec` where `i` is the key
  /// and `x` is the value.
  ///
  /// Example:
  /// ```motoko
  ///
  /// import Nat "mo:base/Nat";
  /// import Debug "mo:base/Debug";
  ///
  /// let vec = Vector.fromArray<Nat>([1, 2, 3]);
  ///
  /// Vector.iterateItems<Nat>(vec, func (i,x) {
  ///   // prints each item (i,x) in vector
  ///   Debug.print(Nat.toText(i) # Nat.toText(x));
  /// });
  /// ```
  ///
  /// Runtime: `O(size)`
  ///
  /// Space: `O(size)`
  ///
  /// *Runtime and space assumes that `f` runs in O(1) time and space.
  public func iterateItems<X>(vec : Vector<X>, f : (Nat, X) -> ()) {
    /* Inlined version of
      let o = object {
        var i = 0;
        public func fx(x : X) { f(i, x); i += 1; };
      };
      iterate<X>(vec, o.fx);
    */
    let blocks = vec.data_blocks.size();
    var i_block = 0;
    var i_element = 0;
    var size = 0;
    var db : [var ?X] = [var];
    var i = 0;

    loop {
      if (i_element == size) {
        i_block += 1;
        if (i_block >= blocks) return;
        db := vec.data_blocks[i_block];
        size := db.size();
        if (size == 0) return;
        i_element := 0;
      };
      switch (db[i_element]) {
        case (?x) {
          f(i, x);
          i_element += 1;
          i += 1;
        };
        case (_) return;
      };
    };
  };

  /// Like `iterateItems` but iterates through the vector in reverse order,
  /// from end to beginning.
  ///
  /// Example:
  /// ```motoko
  ///
  /// import Nat "mo:base/Nat";
  /// import Debug "mo:base/Debug";
  ///
  /// let vec = Vector.fromArray<Nat>([1, 2, 3]);
  ///
  /// Vector.iterateItemsRev<Nat>(vec, func (i,x) {
  ///   // prints each item (i,x) in vector
  ///   Debug.print(Nat.toText(i) # Nat.toText(x));
  /// });
  /// ```
  ///
  /// Runtime: `O(size)`
  ///
  /// Space: `O(size)`
  ///
  /// *Runtime and space assumes that `f` runs in O(1) time and space.
  public func iterateItemsRev<X>(vec : Vector<X>, f : (Nat, X) -> ()) {
    var i_block = vec.i_block;
    var i_element = vec.i_element;
    var db : [var ?X] = if (i_block < vec.data_blocks.size()) {
      vec.data_blocks[i_block];
    } else { [var] };
    var i = size(vec);

    loop {
      if (i_block == 1) {
        return;
      };
      if (i_element == 0) {
        i_block -= 1;
        db := vec.data_blocks[i_block];
        i_element := db.size() - 1;
      } else {
        i_element -= 1;
      };
      i -= 1;
      switch (db[i_element]) {
        case (?x) f(i, x);
        case (_) Prim.trap(INTERNAL_ERROR);
      };
    };
  };

  /// Applies `f` to each element in `vec` in reverse order.
  ///
  /// Example:
  /// ```motoko
  ///
  /// import Nat "mo:base/Nat";
  /// import Debug "mo:base/Debug";
  ///
  /// let vec = Vector.fromArray<Nat>([1, 2, 3]);
  ///
  /// Vector.iterate<Nat>(vec, func (x) {
  ///   Debug.print(Nat.toText(x)); // prints each element in vector in reverse order
  /// });
  /// ```
  ///
  /// Runtime: `O(size)`
  ///
  /// Space: `O(size)`
  ///
  /// *Runtime and space assumes that `f` runs in O(1) time and space.
  public func iterateRev<X>(vec : Vector<X>, f : X -> ()) {
    var i_block = vec.i_block;
    var i_element = vec.i_element;
    var db : [var ?X] = if (i_block < vec.data_blocks.size()) {
      vec.data_blocks[i_block];
    } else { [var] };

    loop {
      if (i_block == 1) {
        return;
      };
      if (i_element == 0) {
        i_block -= 1;
        db := vec.data_blocks[i_block];
        i_element := db.size() - 1;
      } else {
        i_element -= 1;
      };
      switch (db[i_element]) {
        case (?x) f(x);
        case (_) Prim.trap(INTERNAL_ERROR);
      };
    };
  };

  /// Returns true if Vector contains element with respect to equality
  /// defined by `equal`.
  ///
  ///
  /// Example:
  /// ```motoko
  ///
  /// import Nat "mo:base/Nat";
  ///
  /// Vector.add(vec, 2);
  /// Vector.add(vec, 0);
  /// Vector.add(vec, 3);
  ///
  /// Vector.contains<Nat>(vec, 2, Nat.equal); // => true
  /// ```
  ///
  /// Runtime: `O(size)`
  ///
  /// Space: `O(1)`
  ///
  /// *Runtime and space assumes that `equal` runs in O(1) time and space.
  public func contains<X>(vec : Vector<X>, element : X, equal : (X, X) -> Bool) : Bool {
    Option.isSome(indexOf(element, vec, equal));
  };

  /// Finds the greatest element in `vec` defined by `compare`.
  /// Returns `null` if `vec` is empty.
  ///
  ///
  /// Example:
  /// ```motoko
  ///
  /// import Nat "mo:base/Nat";
  ///
  /// Vector.add(vec, 1);
  /// Vector.add(vec, 2);
  ///
  /// Vector.max<Nat>(vec, Nat.compare); // => ?2
  /// ```
  ///
  /// Runtime: `O(size)`
  ///
  /// Space: `O(1)`
  ///
  /// *Runtime and space assumes that `compare` runs in O(1) time and space.
  public func max<X>(vec : Vector<X>, compare : (X, X) -> Order.Order) : ?X {
    if (size(vec) == 0) return null;

    var maxSoFar = get(vec, 0);
    iterate<X>(
      vec,
      func(x) = switch (compare(x, maxSoFar)) {
        case (#greater) maxSoFar := x;
        case _ {};
      },
    );

    return ?maxSoFar;
  };

  /// Finds the least element in `vec` defined by `compare`.
  /// Returns `null` if `vec` is empty.
  ///
  /// Example:
  /// ```motoko
  ///
  /// import Nat "mo:base/Nat";
  ///
  /// Vector.add(vec, 1);
  /// Vector.add(vec, 2);
  ///
  /// Vector.min<Nat>(vec, Nat.compare); // => ?1
  /// ```
  ///
  /// Runtime: `O(size)`
  ///
  /// Space: `O(1)`
  ///
  /// *Runtime and space assumes that `compare` runs in O(1) time and space.
  public func min<X>(vec : Vector<X>, compare : (X, X) -> Order.Order) : ?X {
    if (size(vec) == 0) return null;

    var minSoFar = get(vec, 0);
    iterate<X>(
      vec,
      func(x) = switch (compare(x, minSoFar)) {
        case (#less) minSoFar := x;
        case _ {};
      },
    );

    return ?minSoFar;
  };

  /// Defines equality for two vectors, using `equal` to recursively compare elements in the
  /// vectors. Returns true iff the two vectors are of the same size, and `equal`
  /// evaluates to true for every pair of elements in the two vectors of the same
  /// index.
  ///
  ///
  /// Example:
  /// ```motoko
  ///
  /// import Nat "mo:base/Nat";
  ///
  /// let vec1 = Vector.fromArray<Nat>([1,2]);
  /// let vec2 = Vector.new<Nat>();
  /// vec2.add(1);
  /// vec2.add(2);
  ///
  /// Vector.equal<Nat>(vec1, vec2, Nat.equal); // => true
  /// ```
  ///
  /// Runtime: `O(size)`
  ///
  /// Space: `O(1)`
  ///
  /// *Runtime and space assumes that `equal` runs in O(1) time and space.
  public func equal<X>(vec1 : Vector<X>, vec2 : Vector<X>, equal : (X, X) -> Bool) : Bool {
    let size1 = size(vec1);

    if (size1 != size(vec2)) return false;

    let next1 = vals_(vec1).unsafe_next;
    let next2 = vals_(vec2).unsafe_next;
    var i = 0;
    while (i < size1) {
      if (not equal(next1(), next2())) return false;
      i += 1;
    };

    return true;
  };

  /// Defines comparison for two vectors, using `compare` to recursively compare elements in the
  /// vectors. Comparison is defined lexicographically.
  ///
  ///
  /// Example:
  /// ```motoko
  ///
  /// import Nat "mo:base/Nat";
  ///
  /// let vec1 = Vector.fromArray<Nat>([1,2]);
  /// let vec2 = Vector.new<Nat>();
  /// vec2.add(1);
  /// vec2.add(2);
  ///
  /// Vector.compare<Nat>(vec1, vec2, Nat.compare); // => #less
  /// ```
  ///
  /// Runtime: `O(size)`
  ///
  /// Space: `O(1)`
  ///
  /// *Runtime and space assumes that `compare` runs in O(1) time and space.
  public func compare<X>(vec1 : Vector<X>, vec2 : Vector<X>, compare_fn : (X, X) -> Order.Order) : Order.Order {
    let size1 = size(vec1);
    let size2 = size(vec2);
    let minSize = if (size1 < size2) { size1 } else { size2 };

    let next1 = vals_(vec1).unsafe_next;
    let next2 = vals_(vec2).unsafe_next;
    var i = 0;
    while (i < minSize) {
      switch (compare_fn(next1(), next2())) {
        case (#less) return #less;
        case (#greater) return #greater;
        case _ {};
      };
      i += 1;
    };

    return natCompare(size1, size2);
  };

  /// Creates a textual representation of `vec`, using `toText` to recursively
  /// convert the elements into Text.
  ///
  /// Example:
  /// ```motoko
  ///
  /// import Nat "mo:base/Nat";
  ///
  /// let vec = Vector.fromArray<Nat>([1,2,3,4]);
  ///
  /// Vector.toText<Nat>(vec, Nat.toText); // => "[1, 2, 3, 4]"
  /// ```
  ///
  /// Runtime: `O(size)`
  ///
  /// Space: `O(size)`
  ///
  /// *Runtime and space assumes that `toText` runs in O(1) time and space.
  public func toText<X>(vec : Vector<X>, toText_fn : X -> Text) : Text {
    let vsize : Int = size(vec);
    let next = vals_(vec).unsafe_next;
    var i = 0;
    var text = "";
    while (i < vsize - 1) {
      text := text # toText_fn(next()) # ", "; // Text implemented as rope
      i += 1;
    };
    if (vsize > 0) {
      // avoid the trailing comma
      text := text # toText_fn(get<X>(vec, i));
    };

    "[" # text # "]";
  };

  /// Collapses the elements in `vec` into a single value by starting with `base`
  /// and progessively combining elements into `base` with `combine`. Iteration runs
  /// left to right.
  ///
  /// Example:
  /// ```motoko
  ///
  /// import Nat "mo:base/Nat";
  ///
  /// let vec = Vector.fromArray<Nat>([1,2,3]);
  ///
  /// Vector.foldLeft<Text, Nat>(vec, "", func (acc, x) { acc # Nat.toText(x)}); // => "123"
  /// ```
  ///
  /// Runtime: `O(size)`
  ///
  /// Space: `O(1)`
  ///
  /// *Runtime and space assumes that `combine` runs in O(1)` time and space.
  public func foldLeft<A, X>(vec : Vector<X>, base : A, combine : (A, X) -> A) : A {
    var accumulation = base;

    iterate<X>(
      vec,
      func(x) = accumulation := combine(accumulation, x),
    );

    accumulation;
  };

  /// Collapses the elements in `vec` into a single value by starting with `base`
  /// and progessively combining elements into `base` with `combine`. Iteration runs
  /// right to left.
  ///
  /// Example:
  /// ```motoko
  ///
  /// import Nat "mo:base/Nat";
  ///
  /// let vec = Vector.fromArray<Nat>([1,2,3]);
  ///
  /// Vector.foldRight<Nat, Text>(vec, "", func (x, acc) { Nat.toText(x) # acc }); // => "123"
  /// ```
  ///
  /// Runtime: `O(size)`
  ///
  /// Space: `O(1)`
  ///
  /// *Runtime and space assumes that `combine` runs in O(1)` time and space.
  public func foldRight<X, A>(vec : Vector<X>, base : A, combine : (X, A) -> A) : A {
    var accumulation = base;

    iterateRev<X>(
      vec,
      func(x) = accumulation := combine(x, accumulation),
    );

    accumulation;
  };

  /// Returns a new vector with capacity and size 1, containing `element`.
  ///
  /// Example:
  /// ```motoko
  ///
  /// import Nat "mo:base/Nat";
  ///
  /// let vec = Vector.make<Nat>(1);
  /// Vector.toText<Nat>(vec, Nat.toText); // => "[1]"
  /// ```
  ///
  /// Runtime: `O(1)`
  ///
  /// Space: `O(1)`
  public func make<X>(element : X) : Vector<X> = init(1, element);

  /// Reverses the order of elements in `vec` by overwriting in place.
  ///
  /// Example:
  /// ```motoko
  ///
  /// import Nat "mo:base/Nat";
  ///
  /// let vec = Vector.fromArray<Nat>([1,2,3]);
  ///
  /// Vector.reverse<Nat>(vec);
  /// Vector.toText<Nat>(vec, Nat.toText); // => "[3, 2, 1]"
  /// ```
  ///
  /// Runtime: `O(size)`
  ///
  /// Space: `O(1)`
  public func reverse<X>(vec : Vector<X>) {
    let vsize = size(vec);
    if (vsize == 0) return;

    var i = 0;
    var j = vsize - 1 : Nat;
    var temp = get(vec, 0);
    while (i < vsize / 2) {
      temp := get(vec, j);
      put(vec, j, get(vec, i));
      put(vec, i, temp);
      i += 1;
      j -= 1;
    };
  };

  /// Reverses the order of elements in `vec` and returns a new
  /// Vector.
  ///
  /// Example:
  /// ```motoko
  ///
  /// import Nat "mo:base/Nat";
  ///
  /// let vec = Vector.fromArray<Nat>([1,2,3]);
  ///
  /// let rvec = Vector.reversed<Nat>(vec);
  /// Vector.toText<Nat>(rvec, Nat.toText); // => "[3, 2, 1]"
  /// ```
  ///
  /// Runtime: `O(size)`
  ///
  /// Space: `O(1)`
  public func reversed<X>(vec : Vector<X>) : Vector<X> {
    let rvec = new<X>();

    iterateRev<X>(
      vec,
      func(x) = add(rvec, x),
    );

    rvec;
  };

  /// Returns true if and only if the vector is empty.
  ///
  /// Example:
  /// ```motoko
  ///
  /// let vec = Vector.fromArray<Nat>([2,0,3]);
  /// Vector.isEmpty<Nat>(vec); // => false
  /// ```
  ///
  /// Runtime: `O(1)`
  ///
  /// Space: `O(1)`
  public func isEmpty<X>(vec : Vector<X>) : Bool {
    vec.i_block == 1 and vec.i_element == 0;
  };
};
