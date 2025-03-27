"use client";

import { useFormState } from "react-dom";
import { resetPasswordAction } from "./actions";

const initialPasswordResetState = { message: "" };

export function PasswordResetForm() {
  const [state, action] = useFormState(resetPasswordAction, initialPasswordResetState);
  
  return (
    <form action={action} className="space-y-4">
      <div>
        <label
          htmlFor="form-reset.password"
          className="block text-gray-700 font-semibold mb-2"
        >
          New Password
        </label>
        <input
          type="password"
          id="form-reset.password"
          name="password"
          autoComplete="new-password"
          required
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
      >
        Reset Password
      </button>
      {state.message && (
        <p className="text-center text-red-500 text-sm">{state.message}</p>
      )}
    </form>
  );
}
