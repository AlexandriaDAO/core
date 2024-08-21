import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import {bindCompare; fail} "./utils";

module {
	public class ExpectPrincipal<T>(val : Principal) {
		func show(v : Principal) : Text = "principal \"" # Principal.toText(v) # "\"";

		public let equal = bindCompare<Principal>(val, Principal.equal, show, "");
		public let notEqual = bindCompare<Principal>(val, Principal.notEqual, show, "!=");
		public let less = bindCompare<Principal>(val, Principal.less, show, "<");
		public let lessOrEqual = bindCompare<Principal>(val, Principal.lessOrEqual, show, "<=");
		public let greater = bindCompare<Principal>(val, Principal.greater, show, ">");
		public let greaterOrEqual = bindCompare<Principal>(val, Principal.greaterOrEqual, show, ">=");
		public func isAnonymous() {
			if (not Principal.isAnonymous(val)) {
				fail(show(val), "", show(Principal.fromBlob("\04")));
			};
		};
		public func notAnonymous() {
			if (Principal.isAnonymous(val)) {
				fail(show(val), "!=", show(Principal.fromBlob("\04")));
			};
		};
	};
};