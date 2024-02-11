import { get, writable, type Writable } from 'svelte/store';
import type { QueryTOTP, TOTPId } from '../../../../declarations/backend/backend.did.d.ts';
import { addTotp, deleteTotp, getTotps, updateTotp } from '$lib/api';
import { busyStore, toastsStore } from '@dfinity/gix-components';
import { encryptionKey } from './encryption-key.store';
import { hex_encode, hex_decode } from '$lib/utils/hex.utils';
import { authStore } from '$lib/auth.store';
import * as OTP from 'one-time-password';

// export type TOTPData = Array<QueryTOTP>;

export type EncryptedTotps = Array<QueryTOTP>;
export type DecryptedTotps = Array<{
	id: bigint;
	key: string;
	name: string;
}>;

export type TOTPData = { encryptedTotps: Array<QueryTOTP>; decryptedTotps: DecryptedTotps };

type UpdateTotp = {
	id: bigint;
	key: string;
	name: string;
};

interface TOTPStore extends Writable<TOTPData> {
	fetchTOTP: () => Promise<void>;
	addTOTP: (totpKey: string, totpName: string) => Promise<void>;
	deleteTOTP: (totpId: TOTPId) => Promise<void>;
	updateTOTP: (totp: UpdateTotp) => Promise<void>;
	sync: () => Promise<void>;
	// encrypted totp data storeOnLocalStorage, restorefromLocalStorage
}
const init = async (): Promise<TOTPStore> => {
	const { set, update, subscribe } = writable<TOTPData>({ encryptedTotps: [], decryptedTotps: [] });

	return {
		set,
		update,
		subscribe,
		fetchTOTP: async () => {
			busyStore.startBusy({ initiator: 'fetchTOTP', text: 'Fetching TOTP...' });

			const result = await getTotps();

			busyStore.stopBusy('fetchTOTP');
			if ('ok' in result) {
				busyStore.startBusy({ initiator: 'decryptingTotp', text: 'Decrypting...' });

				let decryptedTotps = await decryptTotp(result.ok);

				busyStore.stopBusy('decryptingTotp');

				set({ encryptedTotps: result.ok, decryptedTotps });
			} else if ('err' in result) {
				if (result.err === 'Anonymous caller not allowed') {
					toastsStore.show({ text: result.err, level: 'error' });
				} else {
					toastsStore.show({ text: result.err, level: 'info' });
				}
			}
		},
		addTOTP: async (totpKey, totpName) => {
			if (get(encryptionKey) !== null) {
				try {
					let nowDate = Date.now();
					let token = OTP.generate(totpKey, undefined, undefined, nowDate);
					OTP.verify(totpKey, token, undefined, undefined, nowDate);
				} catch (error) {
					toastsStore.show({ text: 'Key verification failed :' + error, level: 'error' });
					return;
				}

				busyStore.startBusy({ initiator: 'addingTOTP', text: 'Encrypting...' });
				const encrypted = await encryptKeyandName(totpKey, totpName);

				const encryptedKey = encrypted.encryptedKey;
				const encryptedName = encrypted.encryptedName;

				busyStore.startBusy({ initiator: 'addingTOTP', text: 'Adding to the backend...' });

				const result = await addTotp(encryptedKey, encryptedName);

				busyStore.stopBusy('addingTOTP');
				if ('ok' in result) {
					const id = result.ok;
					update((totpData) => ({
						encryptedTotps: [...totpData.encryptedTotps, { id, encryptedKey, encryptedName }],
						decryptedTotps: [...totpData.decryptedTotps, { id, key: totpKey, name: totpName }]
					}));
					toastsStore.show({ text: 'New TOTP added', level: 'success', duration: 10000 });
				} else if ('err' in result) {
					toastsStore.show({ text: result.err, level: 'error' });
				}
			} else {
				toastsStore.show({ text: 'No symmetric key to encrypt', level: 'error' });
			}
		},
		deleteTOTP: async (totpId) => {
			if (get(authStore).isAuthenticated) {
				busyStore.startBusy({ initiator: 'deleteTOTP', text: 'Deleting...' });
				const result = await deleteTotp(totpId);
				busyStore.stopBusy('deleteTOTP');

				if ('ok' in result) {
					update((totpData) => ({
						encryptedTotps: totpData.encryptedTotps.filter((totp) => totp.id !== totpId),
						decryptedTotps: totpData.decryptedTotps.filter((totp) => totp.id !== totpId)
					}));
				} else if ('err' in result) {
					toastsStore.show({ text: result.err, level: 'error' });
				}
			} else {
				toastsStore.show({ text: 'Not authenticated', level: 'error' });
			}
		},
		updateTOTP: async (totp) => {
			if (get(encryptionKey) !== null) {
				try {
					let nowDate = Date.now();
					let token = OTP.generate(totp.key, undefined, undefined, nowDate);
					OTP.verify(totp.key, token, undefined, undefined, nowDate);
				} catch (error) {
					toastsStore.show({ text: 'Key verification failed :' + error, level: 'error' });
					return;
				}

				busyStore.startBusy({ initiator: 'updateTOTP', text: 'Encrypting...' });

				const encrypted = await encryptKeyandName(totp.key, totp.name);

				const encryptedKey = encrypted.encryptedKey;
				const encryptedName = encrypted.encryptedName;

				busyStore.startBusy({ initiator: 'updateTOTP', text: 'Updating...' });
				const result = await updateTotp({ id: totp.id, encryptedKey, encryptedName });
				busyStore.stopBusy('updateTOTP');

				if ('ok' in result) {
					update((totpData) => {
						let decryptedTotps = totpData.decryptedTotps;
						const index = decryptedTotps.findIndex((decryptTotp) => decryptTotp.id === totp.id);
						decryptedTotps[index] = totp;

						return { encryptedTotps: result.ok, decryptedTotps };
					});
				} else if ('err' in result) {
					toastsStore.show({ text: result.err, level: 'error' });
				}
			} else {
				toastsStore.show({ text: 'No symmetric key to encrypt', level: 'error' });
			}
		},
		sync: async () => {
			const result = await getTotps();

			if ('ok' in result) {
				let decryptedTotps = await decryptTotp(result.ok);

				set({ encryptedTotps: result.ok, decryptedTotps });
			} else if ('err' in result) {
			}
		}
	};
};
export const totpStore: TOTPStore = await init();

async function encryptKeyandName(
	totpKey: string,
	totpName: string
): Promise<{ encryptedKey: string; encryptedName: string }> {
	if (get(encryptionKey) !== null) {
		// Generate a random initialization vector (IV)
		const iv_forKey = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bits; unique per message

		const iv_forName = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bits; unique per message

		// Step 2: Import the rawKey as an AES-GCM key
		const aes_key = await window.crypto.subtle.importKey(
			'raw',
			get(encryptionKey) as BufferSource,
			'AES-GCM',
			false,
			['encrypt']
		);

		// Encode the plaintext otpKey and totpName into a binary format
		const totpKeyEncoded = new TextEncoder().encode(totpKey);
		const totpNameEncoded = new TextEncoder().encode(totpName);

		// Step 4: Encrypt the  otpKey and totpName using AES-GCM
		const encryptedKey_buffer = await window.crypto.subtle.encrypt(
			{ name: 'AES-GCM', iv: iv_forKey },
			aes_key,
			totpKeyEncoded
		);
		const encryptedName_buffer = await window.crypto.subtle.encrypt(
			{ name: 'AES-GCM', iv: iv_forName },
			aes_key,
			totpNameEncoded
		);

		// Step 5: Convert the encryptedtotpKey_buffer and  encryptedtotpName_buffer buffer to a Uint8Array
		const encryptedKey_uint8Array = new Uint8Array(encryptedKey_buffer);
		const encryptedName_uint8Array = new Uint8Array(encryptedName_buffer);

		// Step 6 a: Combine the IV and encryptedtotpKey_uint8Array into a single array
		var iv_and_encryptedKey = new Uint8Array(iv_forKey.length + encryptedKey_uint8Array.length);
		iv_and_encryptedKey.set(iv_forKey, 0);
		iv_and_encryptedKey.set(encryptedKey_uint8Array, iv_forKey.length);

		// Step 6 b: Combine the IV and encryptedtotpName_buffer into a single array
		var iv_and_encryptedName = new Uint8Array(iv_forName.length + encryptedName_uint8Array.length);
		iv_and_encryptedName.set(iv_forName, 0);
		iv_and_encryptedName.set(encryptedName_uint8Array, iv_forName.length);

		// Step 7: Convert the combined array to a hexadecimal string
		const encryptedKey = hex_encode(iv_and_encryptedKey);
		const encryptedName = hex_encode(iv_and_encryptedName);

		return { encryptedKey, encryptedName };
	} else {
		toastsStore.show({ text: 'No symmetric key to encrypt', level: 'error' });
	}
	return { encryptedKey: '', encryptedName: '' };
}

async function decryptTotp(encryptedTotps: Array<QueryTOTP>): Promise<DecryptedTotps> {
	if (get(encryptionKey) !== null) {
		const aes_key = await window.crypto.subtle.importKey(
			'raw',
			get(encryptionKey) as BufferSource,
			'AES-GCM',
			false,
			['decrypt']
		);
		let decryptedArray: DecryptedTotps = [];

		encryptedTotps.forEach(async (encryptedTotp) => {
			const iv_and_encryptedKey = hex_decode(encryptedTotp.encryptedKey);
			const iv_forKey = iv_and_encryptedKey.subarray(0, 12); // 96-bits; unique per message
			const encryptedKey = iv_and_encryptedKey.subarray(12);
			let decryptedKey = await window.crypto.subtle.decrypt(
				{ name: 'AES-GCM', iv: iv_forKey },
				aes_key,
				encryptedKey
			);
			const key = new TextDecoder().decode(decryptedKey);

			const iv_and_encryptedName = hex_decode(encryptedTotp.encryptedName);
			const iv_forName = iv_and_encryptedName.subarray(0, 12); // 96-bits; unique per message
			const encryptedName = iv_and_encryptedName.subarray(12);
			let decryptedName = await window.crypto.subtle.decrypt(
				{ name: 'AES-GCM', iv: iv_forName },
				aes_key,
				encryptedName
			);
			const name = new TextDecoder().decode(decryptedName);

			decryptedArray.push({ id: encryptedTotp.id, key, name });
		});

		return decryptedArray;
	} else {
		toastsStore.show({ text: 'No symmetric key to decrypt', level: 'error' });
		return [];
	}
}
