export const idlFactory = ({ IDL }) => {
  const Password = IDL.Record({
    'encryptedUrl' : IDL.Text,
    'encryptedUsername' : IDL.Text,
    'encryptedName' : IDL.Text,
    'encryptedPass' : IDL.Text,
  });
  const PassId = IDL.Nat;
  const Result_4 = IDL.Variant({ 'ok' : PassId, 'err' : IDL.Text });
  const TOTPId = IDL.Nat;
  const Result_3 = IDL.Variant({ 'ok' : TOTPId, 'err' : IDL.Text });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const QueryPassword = IDL.Record({
    'id' : IDL.Nat,
    'encryptedUrl' : IDL.Text,
    'encryptedUsername' : IDL.Text,
    'encryptedName' : IDL.Text,
    'encryptedPass' : IDL.Text,
  });
  const Result_1 = IDL.Variant({
    'ok' : IDL.Vec(QueryPassword),
    'err' : IDL.Text,
  });
  const QueryTOTP = IDL.Record({
    'id' : IDL.Nat,
    'encryptedKey' : IDL.Text,
    'encryptedName' : IDL.Text,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Vec(QueryTOTP), 'err' : IDL.Text });
  const anon_class_18_1 = IDL.Service({
    'add_password' : IDL.Func([Password], [Result_4], []),
    'add_totp' : IDL.Func([IDL.Text, IDL.Text], [Result_3], []),
    'app_vetkd_public_key' : IDL.Func(
        [IDL.Vec(IDL.Vec(IDL.Nat8))],
        [IDL.Text],
        [],
      ),
    'cycle_balance' : IDL.Func([], [IDL.Nat], ['query']),
    'delete_password' : IDL.Func([PassId], [Result_2], []),
    'delete_totp' : IDL.Func([TOTPId], [Result_2], []),
    'encrypted_symmetric_key_for_caller' : IDL.Func(
        [IDL.Vec(IDL.Nat8)],
        [IDL.Text],
        [],
      ),
    'get_initializer' : IDL.Func([], [IDL.Text], []),
    'get_passwords' : IDL.Func([], [Result_1], []),
    'get_totps' : IDL.Func([], [Result], []),
    'symmetric_key_verification_key' : IDL.Func([], [IDL.Text], []),
    'update_password' : IDL.Func([QueryPassword], [Result_1], []),
    'update_totp' : IDL.Func([QueryTOTP], [Result], []),
  });
  return anon_class_18_1;
};
export const init = ({ IDL }) => { return []; };
