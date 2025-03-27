"use client";

import { loginAction } from "./actions";
import { useActionState } from "react";

const initialState = {
  message: "",
};

export function LoginForm() {
  const [state, action] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="form-login.email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="form-login.email"
          name="email"
          autoComplete="username"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="form-login.password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="form-login.password"
          name="password"
          autoComplete="current-password"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Continue
        </button>
      </div>
      {state.message && <p className="text-sm text-red-600">{state.message}</p>}
    </form>
  );
}
