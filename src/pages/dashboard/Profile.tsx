import { useState } from "react";
import { toast } from "sonner";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Feedback";
import { useChangePassword, useLogout, useUpdateProfile } from "@/hooks/auth";
import { errorMessage } from "@/lib/api";
import { useAuth } from "@/stores/auth";

export default function Profile({ standalone = false }: { standalone?: boolean }) {
  const user = useAuth((s) => s.user)!;
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const logout = useLogout();
  const [form, setForm] = useState({ name: user.name, phone: user.phone ?? "", agency: user.agency ?? "" });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });

  return (
    <div className={standalone ? "container-page max-w-3xl pb-20 pt-32" : "max-w-3xl"}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Your profile</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
            {user.email} <Badge tone="green" className="capitalize">{user.role}</Badge>
            {user.role === "agent" && (user.isVerified ? <Badge tone="blue">Verified</Badge> : <Badge tone="gold">Unverified</Badge>)}
          </p>
        </div>
        {standalone && (
          <Button variant="outline" onClick={logout}>
            Sign out
          </Button>
        )}
      </div>

      <form
        className="space-y-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
        onSubmit={(e) => {
          e.preventDefault();
          updateProfile.mutate(
            { name: form.name, phone: form.phone || undefined, agency: form.agency || undefined },
            { onSuccess: () => toast.success("Profile updated"), onError: (err) => toast.error(errorMessage(err)) },
          );
        }}
      >
        <h2 className="font-bold">Personal details</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          {user.role !== "user" && (
            <Field label="Agency / company" className="sm:col-span-2">
              <Input value={form.agency} onChange={(e) => setForm({ ...form, agency: e.target.value })} />
            </Field>
          )}
        </div>
        <Button type="submit" loading={updateProfile.isPending}>
          Save changes
        </Button>
      </form>

      <form
        className="mt-6 space-y-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
        onSubmit={(e) => {
          e.preventDefault();
          changePassword.mutate(pw, {
            onSuccess: () => {
              toast.success("Password changed");
              setPw({ currentPassword: "", newPassword: "" });
            },
            onError: (err) => toast.error(errorMessage(err)),
          });
        }}
      >
        <h2 className="font-bold">Change password</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Current password">
            <Input type="password" required autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          </Field>
          <Field label="New password" hint="(min. 8 characters)">
            <Input type="password" required minLength={8} autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          </Field>
        </div>
        <Button type="submit" variant="outline" loading={changePassword.isPending}>
          Update password
        </Button>
      </form>
    </div>
  );
}
