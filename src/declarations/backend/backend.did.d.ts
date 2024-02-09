import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type PassId = bigint;
export interface Password {
  'encryptedUrl' : string,
  'encryptedUsername' : string,
  'encryptedName' : string,
  'encryptedPass' : string,
}
export interface QueryPassword {
  'id' : bigint,
  'encryptedUrl' : string,
  'encryptedUsername' : string,
  'encryptedName' : string,
  'encryptedPass' : string,
}
export interface QueryTOTP {
  'id' : bigint,
  'encryptedKey' : string,
  'encryptedName' : string,
}
export type Result = { 'ok' : Array<QueryTOTP> } |
  { 'err' : string };
export type Result_1 = { 'ok' : Array<QueryPassword> } |
  { 'err' : string };
export type Result_2 = { 'ok' : null } |
  { 'err' : string };
export type Result_3 = { 'ok' : TOTPId } |
  { 'err' : string };
export type Result_4 = { 'ok' : PassId } |
  { 'err' : string };
export type TOTPId = bigint;
export interface anon_class_18_1 {
  'add_password' : ActorMethod<[Password], Result_4>,
  'add_totp' : ActorMethod<[string, string], Result_3>,
  'app_vetkd_public_key' : ActorMethod<[Array<Uint8Array | number[]>], string>,
  'cycle_balance' : ActorMethod<[], bigint>,
  'delete_password' : ActorMethod<[PassId], Result_2>,
  'delete_totp' : ActorMethod<[TOTPId], Result_2>,
  'encrypted_symmetric_key_for_caller' : ActorMethod<
    [Uint8Array | number[]],
    string
  >,
  'get_initializer' : ActorMethod<[], string>,
  'get_passwords' : ActorMethod<[], Result_1>,
  'get_totps' : ActorMethod<[], Result>,
  'symmetric_key_verification_key' : ActorMethod<[], string>,
  'update_password' : ActorMethod<[QueryPassword], Result_1>,
  'update_totp' : ActorMethod<[QueryTOTP], Result>,
}
export interface _SERVICE extends anon_class_18_1 {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: ({ IDL }: { IDL: IDL }) => IDL.Type[];
