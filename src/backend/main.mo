import vetkd_system_api "canister:vetkd_system_api";
import Map "mo:map/Map";
import StableBuffer "mo:StableBuffer/StableBuffer";

import T "Types";
import Utils "utils/Utils";
import Hex "utils/Hex";

import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import Cycles "mo:base/ExperimentalCycles";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Text "mo:base/Text";

shared ({ caller = initializer }) actor class () {

	// Types
	type TOTPId = Nat;
	type TOTP = T.TOTP;
	type Result<Ok, Err> = Result.Result<Ok, Err>;
	type StableBuffer<T> = StableBuffer.StableBuffer<T>;
	type QueryTOTP = T.QueryTOTP;
	type PassId = T.PassId;
	type Password = T.Password;
	type QueryPassword = T.QueryPassword;

	// Variables
	let { phash; nhash } = Map;

	// Stable Variables
	private stable var totpId : Nat = 1;
	private stable let totpMap = Map.new<TOTPId, TOTP>();
	private stable let ownerTOTPIds = Map.new<Principal, StableBuffer<TOTPId>>();

	private stable var passId : Nat = 1;
	private stable let passwordMap = Map.new<PassId, Password>();
	private stable let ownerPassIds = Map.new<Principal, StableBuffer<PassId>>();

	// Public Functions
	// TOTP Functions
	public shared ({ caller }) func add_totp(encryptedKey : Text, encryptedName : Text) : async Result<TOTPId, Text> {
		if (Principal.isAnonymous(caller)) return #err("Anonymous caller not allowed");
		let id = totpId;
		switch (Map.get(ownerTOTPIds, phash, caller)) {
			case (?totpIdsBuffer) { StableBuffer.add(totpIdsBuffer, id) };
			case (null) {
				let totpIdsBuffer : StableBuffer<TOTPId> = StableBuffer.init();
				StableBuffer.add(totpIdsBuffer, id);
				Map.set(ownerTOTPIds, phash, caller, totpIdsBuffer);
			};
		};
		Map.set(totpMap, nhash, id, { encryptedKey; encryptedName });
		totpId += 1;
		#ok(id)

	};

	public shared ({ caller }) func get_totps() : async Result<[QueryTOTP], Text> {
		if (Principal.isAnonymous(caller)) return #err("Anonymous caller not allowed");

		switch (Map.get(ownerTOTPIds, phash, caller)) {
			case (?totpIdsBuffer) {
				#ok(Utils.getTOTPs(totpMap, totpIdsBuffer));
			};
			case (null) {
				// return #ok([]); // possible outputs
				#err("You have no TOTP keys");
			};
		};
	};

	public shared ({ caller }) func delete_totp(id : TOTPId) : async Result<(), Text> {
		if (Principal.isAnonymous(caller)) return #err("Anonymous caller not allowed");

		let (?totpIdsBuffer) = Map.get(ownerTOTPIds, phash, caller) else return #err("Error: You have no TOTP keys");
		// let (?idIndex) = StableBuffer.indexOf(id, totpIdsBuffer, Nat.equal) else return #err("Error: Could not find TOTP key");
		// binarySearch in this case very efficient because of our buffer will be always sorted becuase of the ids increasing in ascending order when user add new totps and it is added end of the buffer always
		let (?idIndex) = StableBuffer.binarySearch(id, totpIdsBuffer, Nat.compare) else return #err("Error: Could not find TOTP key");

		// Not necessory to Double check. directly can delete
		// let (?totp) = Map.get(totpMap, nhash, id) else return #err("Error: Could not find TOTP key in Map");
		// if (not Map.has(totpMap, nhash, id)) return #err("Error: Could not find TOTP key in Map");

		let totpId = StableBuffer.remove(totpIdsBuffer, idIndex);
		if (StableBuffer.size(totpIdsBuffer) == 0) { Map.delete(ownerTOTPIds, phash, caller) };
		// Map.delete(totpMap, nhash, id);
		let (?deletedTOTP) = Map.remove(totpMap, nhash, id) else return #err("Error: Could not find TOTP key in Map");
		// #ok("Deleted");
		#ok();
	};

	public shared ({ caller }) func update_totp(totp : QueryTOTP) : async Result<[QueryTOTP], Text> {
		if (Principal.isAnonymous(caller)) return #err("Anonymous caller not allowed");

		let (?totpIdsBuffer) = Map.get(ownerTOTPIds, phash, caller) else return #err("Error: You have no TOTP keys");
		let (?idIndex) = StableBuffer.binarySearch(totp.id, totpIdsBuffer, Nat.compare) else return #err("Error: Could not find TOTP key to update");
		// let (?totp) = Map.get(totpMap, nhash, id) else return #err("Error: Could not find TOTP key in Map");
		let (?previousTOTP) = Map.replace(totpMap, nhash, totp.id, totp) else {
			return #err("Error: Could not find TOTP key in Map to update");
		};
		// returning all TOTPS including updated one
		#ok(Utils.getTOTPs(totpMap, totpIdsBuffer));

	};

	// Password Functions
	public shared ({ caller }) func add_password(password : Password) : async Result<PassId, Text> {
		if (Principal.isAnonymous(caller)) return #err("Anonymous caller not allowed");
		let id = passId;
		switch (Map.get(ownerPassIds, phash, caller)) {
			case (?passIdsBuffer) { StableBuffer.add(passIdsBuffer, id) };
			case (null) {
				let passIdsBuffer = StableBuffer.init<PassId>();
				StableBuffer.add(passIdsBuffer, id);
				Map.set(ownerPassIds, phash, caller, passIdsBuffer);
			};
		};
		Map.set(passwordMap, nhash, id, password);
		passId += 1;
		#ok(id);
	};

	public shared ({ caller }) func get_passwords() : async Result<[QueryPassword], Text> {
		if (Principal.isAnonymous(caller)) return #err("Anonymous caller not allowed");

		switch (Map.get(ownerPassIds, phash, caller)) {
			case (?passIdsBuffer) {
				#ok(Utils.getPasswords(passwordMap, passIdsBuffer));
			};
			case (null) { #err("You have no Passwords") };
		};
	};

	public shared ({ caller }) func delete_password(id : PassId) : async Result<(), Text> {
		if (Principal.isAnonymous(caller)) return #err("Anonymous caller not allowed");

		let (?passIdsBuffer) = Map.get(ownerPassIds, phash, caller) else return #err("Error: You have no Passwords");
		let (?idIndex) = StableBuffer.binarySearch(id, passIdsBuffer, Nat.compare) else return #err("Error: Could not find Password");
		let passId = StableBuffer.remove(passIdsBuffer, idIndex);
		if (StableBuffer.size(passIdsBuffer) == 0) { Map.delete(ownerPassIds, phash, caller) };
		let (?deletedPassword) = Map.remove(passwordMap, nhash, id) else return #err("Error: Could not find Password in Map");
		#ok();
	};

	public shared ({ caller }) func update_password(password : QueryPassword) : async Result<[QueryPassword], Text> {
		if (Principal.isAnonymous(caller)) return #err("Anonymous caller not allowed");

		let (?passIdsBuffer) = Map.get(ownerPassIds, phash, caller) else return #err(("Error: You have no Passwords"));
		let (?idIndex) = StableBuffer.binarySearch(password.id, passIdsBuffer, Nat.compare) else return #err("Error: Could not find Password");
		let (?previousPassword) = Map.replace(passwordMap, nhash, password.id, password) else {
			return #err("Error: Could not find Password in Map");
		};
		// returning all passwords including updated one
		#ok(Utils.getPasswords(passwordMap, passIdsBuffer));
	};

	public shared query ({ caller }) func cycle_balance() : async Nat {
		Cycles.balance();
	};

	public func get_initializer() : async Text {
		return Principal.toText(initializer);
	};

	// VETKeys Implementation
	public shared ({ caller }) func app_vetkd_public_key(derivation_path : [Blob]) : async Text {
		let { public_key } = await vetkd_system_api.vetkd_public_key({
			canister_id = null;
			derivation_path;
			key_id = { curve = #bls12_381; name = "test_key_1" };
		});
		Hex.encode(Blob.toArray(public_key));
	};

	public shared ({ caller }) func symmetric_key_verification_key() : async Text {
		let { public_key } = await vetkd_system_api.vetkd_public_key({
			canister_id = null;
			derivation_path = Array.make(Text.encodeUtf8("symmetric_key"));
			key_id = { curve = #bls12_381; name = "test_key_1" };
		});
		Hex.encode(Blob.toArray(public_key));
	};

	public shared ({ caller }) func encrypted_symmetric_key_for_caller(encryption_public_key : Blob) : async Text {
		// Debug.print("encrypted_symmetric_key_for_caller: caller: " # debug_show (caller));
		let { encrypted_key } = await vetkd_system_api.vetkd_encrypted_key({
			derivation_id = Principal.toBlob(caller);
			public_key_derivation_path = Array.make(Text.encodeUtf8("symmetric_key"));
			key_id = { curve = #bls12_381; name = "test_key_1" };
			encryption_public_key;
		});
		Hex.encode(Blob.toArray(encrypted_key));
	};
};
