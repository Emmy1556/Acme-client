import { useState } from "react";
import { toast } from "sonner";
import { BadgeCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/DashboardLayout";
import { Badge, EmptyState, Pagination, Spinner } from "@/components/ui/Feedback";
import { Input, Select } from "@/components/ui/Field";
import { useUpdateUser, useUsers } from "@/hooks/queries";
import { errorMessage } from "@/lib/api";
import { useAuth } from "@/stores/auth";
import type { Role } from "@/lib/types";

export default function Users() {
  const me = useAuth((s) => s.user);
  const [role, setRole] = useState<Role | "">("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUsers({ role: role || undefined, q: q || undefined, page });
  const update = useUpdateUser();

  const mutate = (id: string, data: Parameters<typeof update.mutate>[0]["data"], msg: string) =>
    update.mutate({ id, data }, { onSuccess: () => toast.success(msg), onError: (e) => toast.error(errorMessage(e)) });

  return (
    <>
      <PageHeader title="Users & Agents" subtitle="Verify agents, change roles and deactivate accounts." />
      <div className="mb-4 flex flex-wrap gap-3">
        <Select className="w-44" value={role} onChange={(e) => { setRole(e.target.value as Role | ""); setPage(1); }} aria-label="Role">
          <option value="">All roles</option>
          <option value="user">Users</option>
          <option value="agent">Agents / landlords</option>
          <option value="admin">Admins</option>
        </Select>
        <Input className="w-64" placeholder="Search name, email, agency…" onKeyDown={(e) => { if (e.key === "Enter") { setQ(e.currentTarget.value); setPage(1); } }} />
      </div>

      {isLoading ? (
        <Spinner />
      ) : data?.items.length ? (
        <>
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.items.map((u) => {
                  const self = u._id === me?._id;
                  return (
                    <tr key={u._id}>
                      <td className="px-4 py-3">
                        <p className="flex items-center gap-1 font-semibold text-gray-900">
                          {u.name} {u.role === "agent" && u.isVerified && <BadgeCheck className="size-4 text-brand-500" />}
                        </p>
                        <p className="text-xs text-gray-500">
                          {u.email}
                          {u.agency && ` · ${u.agency}`}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          className="h-8 w-28 text-xs"
                          value={u.role}
                          disabled={self}
                          onChange={(e) => mutate(u._id, { role: e.target.value as Role }, `Role changed to ${e.target.value}`)}
                          aria-label="Role"
                        >
                          <option value="user">User</option>
                          <option value="agent">Agent</option>
                          <option value="admin">Admin</option>
                        </Select>
                      </td>
                      <td className="px-4 py-3">{u.isActive ? <Badge tone="green">Active</Badge> : <Badge tone="red">Deactivated</Badge>}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {u.role === "agent" && (
                            <button
                              className="rounded-md px-2.5 py-1 text-xs font-semibold text-brand-600 ring-1 ring-brand-200 hover:bg-brand-50"
                              onClick={() => mutate(u._id, { isVerified: !u.isVerified }, u.isVerified ? "Verification removed" : "Agent verified")}
                            >
                              {u.isVerified ? "Unverify" : "Verify"}
                            </button>
                          )}
                          {!self && (
                            <button
                              className="rounded-md px-2.5 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-200 hover:bg-red-50"
                              onClick={() => mutate(u._id, { isActive: !u.isActive }, u.isActive ? "Account deactivated" : "Account reactivated")}
                            >
                              {u.isActive ? "Deactivate" : "Reactivate"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={data.pagination.page} pages={data.pagination.pages} onChange={setPage} />
        </>
      ) : (
        <EmptyState title="No users found" />
      )}
    </>
  );
}
