import { Link } from "react-router";
import { Building2, CheckCircle2, Clock, Eye, Inbox, LandPlot, UserCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ListingsTable } from "@/components/dashboard/ListingsTable";
import { EmptyState, Spinner } from "@/components/ui/Feedback";
import { useAdminProperties, useAdminStats } from "@/hooks/queries";

export default function AdminOverview() {
  const { data: stats } = useAdminStats();
  const { data: pending, isLoading } = useAdminProperties({ status: "pending", limit: 5 });
  const l = stats?.listings;

  return (
    <>
      <PageHeader title="Admin overview" subtitle="Site-wide activity at a glance." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Live listings" value={l?.byStatus.approved ?? 0} icon={CheckCircle2} />
        <StatCard label="Awaiting review" value={l?.byStatus.pending ?? 0} icon={Clock} tone="gold" />
        <StatCard label="Buildings" value={l?.byCategory.building ?? 0} icon={Building2} tone="gray" />
        <StatCard label="Lands" value={l?.byCategory.land ?? 0} icon={LandPlot} tone="gray" />
        <StatCard label="Agents / landlords" value={stats?.agents ?? 0} icon={UserCheck} />
        <StatCard label="Registered users" value={stats?.users ?? 0} icon={Users} tone="gray" />
        <StatCard label="Listing views" value={l?.totalViews ?? 0} icon={Eye} tone="gray" />
        <StatCard label="New enquiries" value={stats?.newInquiries ?? 0} icon={Inbox} tone="gold" />
      </div>

      <div className="mb-4 mt-10 flex items-center justify-between">
        <h2 className="text-lg font-bold">Waiting for your review</h2>
        <Link to="/admin/listings" className="text-sm font-semibold text-brand-600 hover:underline">
          Open moderation queue
        </Link>
      </div>
      {isLoading ? (
        <Spinner />
      ) : pending?.items.length ? (
        <ListingsTable items={pending.items} base="/admin" admin />
      ) : (
        <EmptyState title="All caught up" message="No agent listings are waiting for approval." />
      )}
    </>
  );
}
