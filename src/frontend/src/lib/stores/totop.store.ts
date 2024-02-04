import { get, writable, type Writable } from 'svelte/store';
import type { QueryTOTP, TOTPId } from '../../../../declarations/backend/backend.did';
import { addTotp, deleteTotp, getTotps, updateTotp } from '$lib/api';
import { busyStore, toastsStore } from '@dfinity/gix-components';
import { encryptionKey } from './encryption-key.store';
import { hex_encode } from '$lib/utils/hex.utils';
import { authStore } from '$lib/auth.store';

type TOTPData = Array<QueryTOTP>;

interface TOTPStore extends Writable<TOTPData> {
	fetchTOTP: () => Promise<void>;
	addTOTP: (totpKey: string, totpName: string) => Promise<void>;
	deleteTOTP: (totpId: TOTPId) => Promise<void>;
	updateTOTP: (totp: QueryTOTP) => Promise<void>;
	// storeOnLocalStorage, restorefromLocalStorage
}
const init = async (): Promise<TOTPStore> => {
	const { set, update, subscribe } = writable<TOTPData>([]);

	return {
		set,
		update,
		subscribe,
		fetchTOTP: async () => {
			busyStore.startBusy({ initiator: 'fetchTOTP', text: 'Fetching TOTP...' });

			const result = await getTotps();

			busyStore.stopBusy('fetchTOTP');
			if ('ok' in result) {
				set(result.ok);
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
				busyStore.startBusy({ initiator: 'addingTOTP', text: 'Encrypting...' });

				// Generate a random initialization vector (IV)
				const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bits; unique per message

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
					{ name: 'AES-GCM', iv: iv },
					aes_key,
					totpKeyEncoded
				);
				const encryptedName_buffer = await window.crypto.subtle.encrypt(
					{ name: 'AES-GCM', iv: iv },
					aes_key,
					totpNameEncoded
				);

				// Step 5: Convert the encryptedtotpKey_buffer and  encryptedtotpName_buffer buffer to a Uint8Array
				const encryptedKey_uint8Array = new Uint8Array(encryptedKey_buffer);
				const encryptedName_uint8Array = new Uint8Array(encryptedName_buffer);

				// Step 6 a: Combine the IV and encryptedtotpKey_uint8Array into a single array
				var iv_and_encryptedKey = new Uint8Array(iv.length + encryptedKey_uint8Array.length);
				iv_and_encryptedKey.set(iv, 0);
				iv_and_encryptedKey.set(encryptedKey_uint8Array, iv.length);

				// Step 6 b: Combine the IV and encryptedtotpName_buffer into a single array
				var iv_and_encryptedName = new Uint8Array(iv.length + encryptedName_uint8Array.length);
				iv_and_encryptedName.set(iv, 0);
				iv_and_encryptedName.set(encryptedName_uint8Array, iv.length);

				// Step 7: Convert the combined array to a hexadecimal string and call add_totp backend
				const encryptedKey = hex_encode(iv_and_encryptedKey);
				const encryptedName = hex_encode(iv_and_encryptedName);

				busyStore.startBusy({ initiator: 'addingTOTP', text: 'Adding to the backend...' });

				const result = await addTotp(encryptedKey, encryptedName);

				busyStore.stopBusy('addingTOTP');
				if ('ok' in result) {
					const id = result.ok;
					update((totpData) => [...totpData, { id, encryptedKey, encryptedName }]);
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
					update((totpData) => totpData.filter((totp) => totp.id !== totpId));
				} else if ('err' in result) {
					toastsStore.show({ text: result.err, level: 'error' });
				}
			} else {
				toastsStore.show({ text: 'Not authenticated', level: 'error' });
			}
		},
		updateTOTP: async (totp) => {
			busyStore.startBusy({ initiator: 'updateTOTP', text: 'Updating...' });
			const result = await updateTotp(totp);
			busyStore.stopBusy('updateTOTP');

			if ('ok' in result) {
				set(result.ok);
			} else if ('err' in result) {
				toastsStore.show({ text: result.err, level: 'error' });
			}
		}
	};
};
export const totpStore: TOTPStore = await init();
