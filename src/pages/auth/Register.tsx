import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router";
import { clsx } from "clsx";
import { Building2, User as UserIcon } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useRegister } from "@/hooks/auth";
import { errorMessage } from "@/lib/api";
import { dashboardPathFor, useAuth } from "@/stores/auth";

export default function Register() {
  const [params] = useSearchParams();
  const user = useAuth((s) => s.user);
  const register = useRegister();
  const [role, setRole] = useState<"user" | "agent">(params.get("as") === "agent" ? "agent" : "user");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", agency: "" });

  if (user) return <Navigate to={dashboardPathFor(user.role)} replace />;

  const bind = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value }),
  });

  return (
    <AuthLayout title="Create your account" subtitle="Save time on your property search, or start listing today.">
      <div className="mb-6 grid grid-cols-2 gap-3">
        {(
          [
            { value: "user", label: "I'm looking", icon: UserIcon, desc: "Buy or rent" },
            { value: "agent", label: "Agent / Landlord", icon: Building2, desc: "List properties" },
          ] as const
        ).map(({ value, label, icon: Icon, desc }) => (
          <button
            type="button"
            key={value}
            onClick={() => setRole(value)}
            className={clsx(
              "rounded-lg border-2 p-4 text-left transition",
              role === value ? "border-brand-600 bg-brand-50" : "border-gray-200 hover:border-gray-300",
            )}
            aria-pressed={role === value}
          >
            <Icon className="size-5 text-brand-600" />
            <p className="mt-2 text-sm font-semibold text-gray-900">{label}</p>
            <p className="text-xs text-gray-500">{desc}</p>
          </button>
        ))}
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          register.mutate({
            ...form,
            role,
            phone: form.phone || undefined,
            agency: role === "agent" ? form.agency || undefined : undefined,
          });
        }}
      >
        <Field label="Full name">
          <Input required autoComplete="name" {...bind("name")} />
        </Field>
        <Field label="Email">
          <Input type="email" required autoComplete="email" {...bind("email")} />
        </Field>
        <Field label="Phone" hint={role === "agent" ? "(shown on your listings)" : "(optional)"}>
          <Input type="tel" required={role === "agent"} autoComplete="tel" {...bind("phone")} />
        </Field>
        {role === "agent" && (
          <Field label="Agency / company name" hint="(optional)">
            <Input {...bind("agency")} />
          </Field>
        )}
        <Field label="Password" hint="(min. 8 characters)">
          <Input type="password" required minLength={8} autoComplete="new-password" {...bind("password")} />
        </Field>
        {register.isError && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{errorMessage(register.error)}</p>}
        <Button type="submit" size="lg" className="w-full" loading={register.isPending}>
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
