import T "../Types";
import Map "mo:map/Map";
import Buffer "mo:base/Buffer";
import StableBuffer "mo:StableBuffer/StableBuffer";

module {

	// Types
	type TOTPId = Nat;
	type TOTP = T.TOTP;
	type QueryTOTP = T.QueryTOTP;
	type PassId = T.PassId;
	type Password = T.Password;
	type QueryPassword = T.QueryPassword;

	let { phash; nhash } = Map;

	public func getTOTPs(totpMap : T.Map<TOTPId, TOTP>, totpIdsBuffer : T.StableBuffer<TOTPId>) : [QueryTOTP] {
		let queryTOTPs = Buffer.Buffer<QueryTOTP>(0);

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

	public func getPasswords(passwordMap : T.Map<PassId, Password>, passIdsBuffer : T.StableBuffer<PassId>) : [QueryPassword] {
		let queryPasswords = Buffer.Buffer<QueryPassword>(0);

		for (id in StableBuffer.vals(passIdsBuffer)) {
			switch (Map.get(passwordMap, nhash, id)) {
				case (?password) {
					queryPasswords.add({ password with id });
				};
				case (null) {};
			};
		};
		Buffer.toArray(queryPasswords);
	};
};
