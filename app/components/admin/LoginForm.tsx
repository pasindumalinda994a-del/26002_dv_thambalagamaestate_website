"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="font-secondary text-[11px] font-medium uppercase tracking-[0.18em] text-forest-green/55">
          Password
        </span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="w-full border border-forest-green/25 bg-white px-3 py-3 font-secondary text-[14px] text-forest-green outline-none focus:border-forest-green/50"
        />
      </label>

      {state.error ? (
        <p className="font-secondary text-[13px] text-chestnut" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="bg-forest-green px-6 py-3.5 font-secondary text-[12px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-deep-forest disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
