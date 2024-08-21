import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import {bindCompare; fail} "./utils";

module {
	public class ExpectBlob<T>(blob : Blob) {
		func show(v : Blob) : Text = "blob \"" # debug_show(v) # "\"";

		public let equal = bindCompare<Blob>(blob, Blob.equal, show, "");
		public let notEqual = bindCompare<Blob>(blob, Blob.notEqual, show, "!=");
		public let less = bindCompare<Blob>(blob, Blob.less, show, "<");
		public let lessOrEqual = bindCompare<Blob>(blob, Blob.lessOrEqual, show, "<=");
		public let greater = bindCompare<Blob>(blob, Blob.greater, show, ">");
		public let greaterOrEqual = bindCompare<Blob>(blob, Blob.greaterOrEqual, show, ">=");

		public func size(n : Nat) {
			if (blob.size() != n) {
				fail(
					"blob size " # debug_show(blob.size()),
					"blob size",
					debug_show(n)
				);
			};
		};
	};
};