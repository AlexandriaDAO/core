import Nat16 "mo:base/Nat16";
import {bindCompare} "./utils";

module {
	public class ExpectNat16(val : Nat16) {
		public let equal = bindCompare<Nat16>(val, Nat16.equal, Nat16.toText, "");
		public let notEqual = bindCompare<Nat16>(val, Nat16.notEqual, Nat16.toText, "!=");
		public let less = bindCompare<Nat16>(val, Nat16.less, Nat16.toText, "<");
		public let lessOrEqual = bindCompare<Nat16>(val, Nat16.lessOrEqual, Nat16.toText, "<=");
		public let greater = bindCompare<Nat16>(val, Nat16.greater, Nat16.toText, ">");
		public let greaterOrEqual = bindCompare<Nat16>(val, Nat16.greaterOrEqual, Nat16.toText, ">=");
	};
};