"use client";

import { useFormState } from "react-dom";
import { verifyPasswordResetEmailAction } from "./actions";

const initialPasswordResetEmailVerificationState = { message: "" };

export function PasswordResetEmailVerificationForm() {
  const [state, action] = useFormState(
    verifyPasswordResetEmailAction,
    initialPasswordResetEmailVerificationState
  );
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="form-verify.code" className="block text-gray-700 mb-2">
          Code
        </label>
        <input
          id="form-verify.code"
          name="code"
          required
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
      >
        Verify
      </button>
      {state.message && (
        <p className="text-red-500 text-sm text-center">{state.message}</p>
      )}
    </form>
  );
}
