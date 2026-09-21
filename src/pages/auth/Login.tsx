import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { AuthLayout } from "./AuthLayout";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useLogin } from "@/hooks/auth";
import { errorMessage } from "@/lib/api";
import { dashboardPathFor, useAuth } from "@/stores/auth";

export default function Login() {
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const user = useAuth((s) => s.user);
  const login = useLogin(from);
  const [form, setForm] = useState({ email: "", password: "" });

  if (user) return <Navigate to={from ?? dashboardPathFor(user.role)} replace />;

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage your listings and enquiries.">
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          login.mutate(form);
        }}
      >
        <Field label="Email">
          <Input type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            required
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Field>
        {login.isError && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{errorMessage(login.error)}</p>}
        <Button type="submit" size="lg" className="w-full" loading={login.isPending}>
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <Link to="/register" className="font-semibold text-brand-600 hover:underline">
          Create one
        </Link>
      </p>
      <p className="mt-3 text-center text-sm">
        <Link to="/" className="text-gray-400 hover:text-gray-600">
          ← Back to site
        </Link>
      </p>
    </AuthLayout>
  );
}
