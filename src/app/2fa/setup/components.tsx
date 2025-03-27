"use client";

import { setup2FAAction } from "./actions";
import { useFormState } from "react-dom";

const initial2FASetUpState = {
  message: ""
};

export function TwoFactorSetUpForm({ encodedTOTPKey }: { encodedTOTPKey: string }) {
  const [state, action] = useFormState(setup2FAAction, initial2FASetUpState);
  return (
    <form action={action} className="space-y-4">
      <input name="key" value={encodedTOTPKey} hidden required />
      <div>
        <label htmlFor="form-totp.code" className="block text-gray-700 font-medium mb-2">
          Verify the code from the app
        </label>
        <input
          id="form-totp.code"
          name="code"
          required
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
        Save
      </button>
      {state.message && (
        <p className="text-center text-red-500 text-sm">{state.message}</p>
      )}
    </form>
  );
}
