import Int "mo:base/Int";
import {bindCompare} "./utils";

module {
	public class ExpectInt(val : Int) {
		public let equal = bindCompare<Int>(val, Int.equal, Int.toText, "");
		public let notEqual = bindCompare<Int>(val, Int.notEqual, Int.toText, "!=");
		public let less = bindCompare<Int>(val, Int.less, Int.toText, "<");
		public let lessOrEqual = bindCompare<Int>(val, Int.lessOrEqual, Int.toText, "<=");
		public let greater = bindCompare<Int>(val, Int.greater, Int.toText, ">");
		public let greaterOrEqual = bindCompare<Int>(val, Int.greaterOrEqual, Int.toText, ">=");
	};
};