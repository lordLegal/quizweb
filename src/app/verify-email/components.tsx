"use client";

import { resendEmailVerificationCodeAction, verifyEmailAction } from "./actions";
import { useFormState } from "react-dom";

const emailVerificationInitialState = { message: "" };

export function EmailVerificationForm() {
  const [state, action] = useFormState(verifyEmailAction, emailVerificationInitialState);
  
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="form-verify.code" className="block text-gray-700 font-medium mb-1">
          Verification Code
        </label>
        <input
          id="form-verify.code"
          name="code"
          required
          placeholder="Enter the 8-digit code"
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

const resendEmailInitialState = { message: "" };

export function ResendEmailVerificationCodeForm() {
  const [state, action] = useFormState(resendEmailVerificationCodeAction, resendEmailInitialState);
  
  return (
    <form action={action} className="space-y-4">
      <button
        type="submit"
        className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded"
      >
        Resend code
      </button>
      {state.message && (
        <p className="text-center text-red-500 text-sm">{state.message}</p>
      )}
    </form>
  );
}
