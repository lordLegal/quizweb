"use client";

import { signupAction } from "./actions";
import { useActionState } from "react";

const initialState = { message: "" };

export function SignUpForm() {
  const [state, action] = useActionState(signupAction, initialState);

  return (
    <form action={action} className="space-y-6">
      <div>
        <label htmlFor="form-signup.username" className="block text-gray-700 font-medium mb-1">
          Username
        </label>
        <input
          id="form-signup.username"
          name="username"
          required
          minLength={4}
          maxLength={31}
          placeholder="Enter your username"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="form-signup.email" className="block text-gray-700 font-medium mb-1">
          Email
        </label>
        <input
          type="email"
          id="form-signup.email"
          name="email"
          autoComplete="username"
          required
          placeholder="your@email.com"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="form-signup.password" className="block text-gray-700 font-medium mb-1">
          Password
        </label>
        <input
          type="password"
          id="form-signup.password"
          name="password"
          autoComplete="new-password"
          required
          placeholder="Enter a secure password"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
        Continue
      </button>
      {state.message && (
        <p className="text-center text-red-500 text-sm">{state.message}</p>
      )}
    </form>
  );
}
