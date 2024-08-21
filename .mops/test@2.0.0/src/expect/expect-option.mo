import Option "mo:base/Option";
import {fail} "./utils";

module {
	public class ExpectOption<T>(a : ?T, toText : (T) -> Text, equalFn : (T, T) -> Bool) {
		func _show(opt : ?T) : Text {
			switch (opt) {
				case (?v) "?" # toText(v);
				case (null) "null";
			};
		};

		public func _equal(b : ?T) : Bool {
			switch (a) {
				case (?aVal) {
					switch (b) {
						case (?bVal) {
							if (equalFn(aVal, bVal)) {
								true;
							}
							else {
								false;
							};
						};
						case (null) {
							false;
						};
					};
				};
				case (null) {
					if (Option.isNull(b)) {
						true;
					}
					else {
						false;
					};
				};
			};
		};

		public func equal(b : ?T) {
			if (not _equal(b)) {
				fail(_show(a), "", _show(b));
			};
		};

		public func notEqual(b : ?T) {
			if (_equal(b)) {
				fail(_show(a), "!=", _show(b));
			};
		};

		public func isNull() {
			equal(null);
		};

		public func isSome() {
			notEqual(null);
		};
	};
};