import Principal "mo:base/Principal";

import Types "./types";
import FuzzBlob "./Blob";
import FuzzPrincipal "./Principal";

module {
	public class FuzzICRC1(generator : Types.Generator) {
		let fuzzBlob = FuzzBlob.FuzzBlob(generator);
		let fuzzPrincipal = FuzzPrincipal.FuzzPrincipal(generator);

		public func randomSubaccount() : Blob {
			fuzzBlob.randomBlob(32);
		};

		public func randomAccount() : {owner : Principal; subaccount : ?Blob} {
			{
				owner = fuzzPrincipal.random();
				subaccount = ?fuzzBlob.randomBlob(32);
			}
		};
	};
};