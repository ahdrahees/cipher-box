import { get } from 'svelte/store';
import { authStore } from './auth.store';
import type {
	Password,
	Result_4,
	Result_3,
	PassId,
	Result_2,
	TOTPId,
	Result_1,
	Result,
	QueryPassword,
	QueryTOTP
} from '../../../declarations/backend/backend.did';

export const addPassword = async (password: Password): Promise<Result_4> => {
	const actor = get(authStore).actor;
	return actor.add_password(password);
};

export const addTotp = async (encryptedKey: string, encryptedName: string): Promise<Result_3> => {
	const actor = get(authStore).actor;
	return actor.add_totp(encryptedKey, encryptedName);
};

export const appVetkdPublicKey = async (
	derivationPath: Array<Uint8Array | number[]>
): Promise<string> => {
	const actor = get(authStore).actor;
	return actor.app_vetkd_public_key(derivationPath);
};

export const cycle_balance = async (): Promise<bigint> => {
	const actor = get(authStore).actor;
	return actor.cycle_balance();
};

export const deletePassword = async (passId: PassId): Promise<Result_2> => {
	const actor = get(authStore).actor;
	return actor.delete_password(passId);
};

export const deleteTotp = async (totpId: TOTPId): Promise<Result_2> => {
	const actor = get(authStore).actor;
	return actor.delete_totp(totpId);
};

export const encryptedSymmetricKeyForCaller = async (
	transportPublicKey: Uint8Array | number[]
): Promise<string> => {
	const actor = get(authStore).actor;
	return actor.encrypted_symmetric_key_for_caller(transportPublicKey);
};

export const getInitializer = async (): Promise<string> => {
	const actor = get(authStore).actor;
	return actor.get_initializer();
};

export const getPasswords = async (): Promise<Result_1> => {
	const actor = get(authStore).actor;
	return actor.get_passwords();
};

export const getTotps = async (): Promise<Result> => {
	const actor = get(authStore).actor;
	return actor.get_totps();
};

export const symmetricKeyVerificationKey = async (): Promise<string> => {
	const actor = get(authStore).actor;
	return actor.symmetric_key_verification_key();
};

export const updatePassword = async (queryPassword: QueryPassword): Promise<Result_1> => {
	const actor = get(authStore).actor;
	return actor.update_password(queryPassword);
};

export const updateTotp = async (queryTotp: QueryTOTP): Promise<Result> => {
	const actor = get(authStore).actor;
	return actor.update_totp(queryTotp);
};
