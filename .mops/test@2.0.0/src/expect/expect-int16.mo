import Int16 "mo:base/Int16";
import {bindCompare} "./utils";

module {
	public class ExpectInt16(val : Int16) {
		public let equal = bindCompare<Int16>(val, Int16.equal, Int16.toText, "");
		public let notEqual = bindCompare<Int16>(val, Int16.notEqual, Int16.toText, "!=");
		public let less = bindCompare<Int16>(val, Int16.less, Int16.toText, "<");
		public let lessOrEqual = bindCompare<Int16>(val, Int16.lessOrEqual, Int16.toText, "<=");
		public let greater = bindCompare<Int16>(val, Int16.greater, Int16.toText, ">");
		public let greaterOrEqual = bindCompare<Int16>(val, Int16.greaterOrEqual, Int16.toText, ">=");
	};
};