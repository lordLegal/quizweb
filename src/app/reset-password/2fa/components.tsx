'use client';

import { useFormState } from "react-dom";
import { 
  verifyPasswordReset2FAWithRecoveryCodeAction, 
  verifyPasswordReset2FAWithTOTPAction 
} from "./actions";

const initialPasswordResetTOTPState = { message: "" };

export function PasswordResetTOTPForm() {
  const [state, action] = useFormState(verifyPasswordReset2FAWithTOTPAction, initialPasswordResetTOTPState);
  return (
    <form action={action} className="bg-white p-6 rounded shadow-md w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Authenticator Code</h2>
      <label htmlFor="form-totp.code" className="block text-gray-700 mb-2">
        Code
      </label>
      <input
        id="form-totp.code"
        name="code"
        required
        className="w-full border border-gray-300 p-2 rounded mb-4"
      />
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
        Verify
      </button>
      {state.message && <p className="mt-4 text-red-500">{state.message}</p>}
    </form>
  );
}

const initialPasswordResetRecoveryCodeState = { message: "" };

export function PasswordResetRecoveryCodeForm() {
  const [state, action] = useFormState(
    verifyPasswordReset2FAWithRecoveryCodeAction,
    initialPasswordResetRecoveryCodeState
  );
  return (
    <form action={action} className="bg-white p-6 rounded shadow-md w-full max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Recovery Code</h2>
      <label htmlFor="form-recovery-code.code" className="block text-gray-700 mb-2">
        Recovery Code
      </label>
      <input
        id="form-recovery-code.code"
        name="code"
        required
        className="w-full border border-gray-300 p-2 rounded mb-4"
      />
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
        Verify
      </button>
      {state.message && <p className="mt-4 text-red-500">{state.message}</p>}
    </form>
  );
}
