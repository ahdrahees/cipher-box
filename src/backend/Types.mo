import StableBuffer "mo:StableBuffer/StableBuffer";

import Principal "mo:base/Principal";
import Map "mo:map/Map";

module {

	public type StableBuffer<T> = StableBuffer.StableBuffer<T>;
	public type Map<K, V> = Map.Map<K, V>;

	public type TOTPId = Nat;
	public type PassId = Nat;

	public type TOTP = {
		// id : Nat;
		encryptedKey : Text;
		// owner : Principal;
		encryptedName : Text;
	};

	public type Password = {
		// id : Nat;
		// owner : Principal;
		encryptedName : Text;
		encryptedUsername : Text;
		encryptedPass : Text;
		encryptedUrl : Text;
	};

	public type QueryPassword = {
		id : Nat;
		encryptedName : Text;
		encryptedUsername : Text;
		encryptedPass : Text;
		encryptedUrl : Text;
	};

	/* public type User = {
        // owner : Principal;
        totpIds : StableBuffer<TOTPId>;
        passIds : StableBuffer<PassId>;
    }; */

	///////
	// Avoiding duplecation
	public type TOTP_ = {
		// id : Nat;
		encryptedKey : Text;
		encryptedName : Text;
	};
	public type Password_ = {
		// id : Nat;
		encryptedName : Text;
		encryptedUsername : Text;
		encryptedPass : Text;
		encryptedUrl : Text;
	};

	// Each Map will take additional 100 bytes for an initialised map
	public type User = {
		totps : Map.Map<TOTPId, TOTP_>;
		passwords : Map.Map<Nat, Password_>;

	};
	public type userMap = Map.Map<Principal, User>;

	public type QueryTOTP = {
		id : Nat;
		encryptedKey : Text;
		encryptedName : Text;
	};

	public type VETKD_SYSTEM_API = actor {
		vetkd_public_key : ({
			canister_id : ?Principal;
			derivation_path : [Blob];
			key_id : { curve : { #bls12_381 }; name : Text };
		}) -> async ({ public_key : Blob });
		vetkd_encrypted_key : ({
			public_key_derivation_path : [Blob];
			derivation_id : Blob;
			key_id : { curve : { #bls12_381 }; name : Text };
			encryption_public_key : Blob;
		}) -> async ({ encrypted_key : Blob });
	};

};
