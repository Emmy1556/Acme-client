import { Link } from "react-router";
import { Building2, CheckCircle2, Clock, Eye, Inbox, PlusCircle, XCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ListingsTable } from "@/components/dashboard/ListingsTable";
import { EmptyState, Spinner } from "@/components/ui/Feedback";
import { buttonClass } from "@/components/ui/Button";
import { useAgentStats, useMyProperties } from "@/hooks/queries";
import { useAuth } from "@/stores/auth";

export default function AgentOverview() {
  const user = useAuth((s) => s.user);
  const { data: stats } = useAgentStats();
  const { data: recent, isLoading } = useMyProperties({ limit: 5 });
  const s = stats?.listings.byStatus ?? {};
  const total = (s.approved ?? 0) + (s.pending ?? 0) + (s.rejected ?? 0);

  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.name.split(" ")[0]}`}
        subtitle="Here's how your listings are doing."
        action={
          <Link to="/dashboard/listings/new" className={buttonClass()}>
            <PlusCircle className="size-4" /> Add listing
          </Link>
        }
      />

      {user && !user.isVerified && (
        <div className="mb-6 rounded-lg bg-gold-100 p-4 text-sm text-amber-900">
          Your agent account hasn't been verified yet. You can still add listings — our team reviews each one before it goes live.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total listings" value={total} icon={Building2} />
        <StatCard label="Live" value={s.approved ?? 0} icon={CheckCircle2} />
        <StatCard label="Pending review" value={s.pending ?? 0} icon={Clock} tone="gold" />
        <StatCard label="Rejected" value={s.rejected ?? 0} icon={XCircle} tone="red" />
        <StatCard label="Total views" value={stats?.listings.totalViews ?? 0} icon={Eye} tone="gray" />
        <StatCard label="Enquiries received" value={stats?.inquiries ?? 0} icon={Inbox} tone="gold" />
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-lg bg-brand-50 p-4 text-sm text-brand-800">
        <Inbox className="mt-0.5 size-4 shrink-0" />
        <p>
          Buyers and tenants contact Acme directly — by phone, WhatsApp or the enquiry form — and our team handles
          viewings and offers for your listings. You'll see the number of enquiries each listing attracts here.
        </p>
      </div>

      <div className="mb-4 mt-10 flex items-center justify-between">
        <h2 className="text-lg font-bold">Recent listings</h2>
        <Link to="/dashboard/listings" className="text-sm font-semibold text-brand-600 hover:underline">
          View all
        </Link>
      </div>
      {isLoading ? (
        <Spinner />
      ) : recent?.items.length ? (
        <ListingsTable items={recent.items} base="/dashboard" />
      ) : (
        <EmptyState
          title="No listings yet"
          message="Add your first house or plot of land to start receiving enquiries."
          action={
            <Link to="/dashboard/listings/new" className={buttonClass()}>
              Add your first listing
            </Link>
          }
        />
      )}
    </>
  );
}
