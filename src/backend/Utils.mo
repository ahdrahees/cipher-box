import T "Types";
import Map "mo:map/Map";
import Buffer "mo:base/Buffer";
import StableBuffer "mo:StableBuffer/StableBuffer";

module {

	// Types
	type TOTPId = Nat;
	type TOTP = T.TOTP;
	type QueryTOTPs = T.QueryTOTPs;

	let { phash; nhash } = Map;

	public func getTOTPS(totpMap : T.Map<TOTPId, TOTP>, totpIdsBuffer : T.StableBuffer<TOTPId>) : [T.QueryTOTPs] {
		let queryTOTPs = Buffer.Buffer<QueryTOTPs>(0);

		for (id in StableBuffer.vals(totpIdsBuffer)) {
			switch (Map.get(totpMap, nhash, id)) {
				case (?totp) {
					queryTOTPs.add({ totp with id });
				};
				case (null) {};
			};
		};

		Buffer.toArray(queryTOTPs);
	};
};
