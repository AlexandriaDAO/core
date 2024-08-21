import Array "mo:base/Array";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import {fail} "./utils";

module {
	public class ExpectArray<T>(arr : [T], itemToText : (T) -> Text, itemEqual : (T, T) -> Bool) {
		func _arrayToText(arr : [T], limit : Nat) : Text {
			var text = "[";
			label l do {
				for (i in arr.keys()) {
					text #= itemToText(arr[i]);

					if (i + 1 < arr.size()) {
						if (text.size() > limit) {
							text #= "...";
							break l;
						};
						text #= ", ";
					};
				};
				text #= "]";
			};
			return text;
		};

		public func equal(other : [T]) {
			if (not Array.equal<T>(arr, other, itemEqual)) {
				fail(_arrayToText(arr, 100), "", _arrayToText(other, 100));
			};
		};

		public func notEqual(other : [T]) {
			if (Array.equal<T>(arr, other, itemEqual)) {
				fail(_arrayToText(arr, 100), "", _arrayToText(other, 100));
			};
		};

		public func contains(a : T) {
			let has = Array.find<T>(arr, func b = itemEqual(a, b));
			if (Option.isNull(has)) {
				fail(_arrayToText(arr, 100), "to contain element", itemToText(a));
			};
		};

		public func notContains(a : T) {
			let has = Array.find<T>(arr, func b = itemEqual(a, b));
			if (Option.isSome(has)) {
				fail(_arrayToText(arr, 100), "to not contain element", itemToText(a));
			};
		};

		public func size(n : Nat) {
			if (arr.size() != n) {
				fail(
					"array size " # debug_show(arr.size()) # " - " # _arrayToText(arr, 50),
					"array size",
					debug_show(n)
				);
			};
		};
	};
};