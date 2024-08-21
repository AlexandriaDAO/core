import Char "mo:base/Char";
import {bindCompare} "./utils";

module {
	public class ExpectChar(val : Char) {
		func show(c : Char) : Text = "'" # Char.toText(c) # "'";

		public let equal = bindCompare<Char>(val, Char.equal, show, "");
		public let notEqual = bindCompare<Char>(val, Char.notEqual, show, "!=");
		public let less = bindCompare<Char>(val, Char.less, show, "<");
		public let lessOrEqual = bindCompare<Char>(val, Char.lessOrEqual, show, "<=");
		public let greater = bindCompare<Char>(val, Char.greater, show, ">");
		public let greaterOrEqual = bindCompare<Char>(val, Char.greaterOrEqual, show, ">=");
	};
};