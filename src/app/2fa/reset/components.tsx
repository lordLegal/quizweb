"use client";

import { reset2FAAction } from "./actions";
import { useFormState } from "react-dom";

const initial2FAResetState = { message: "" };

export function TwoFactorResetForm() {
  const [state, action] = useFormState(reset2FAAction, initial2FAResetState);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="form-totp.code" className="block text-gray-700 font-medium mb-1">
          Recovery Code
        </label>
        <input
          id="form-totp.code"
          name="code"
          required
          placeholder="Enter your recovery code"
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
        <p className="text-center text-red-500 text-sm">{state.message}</p>
      )}
    </form>
  );
}
