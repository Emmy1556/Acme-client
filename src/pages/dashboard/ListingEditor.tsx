import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { PageHeader, useDashboardBase } from "@/components/layout/DashboardLayout";
import { PropertyForm } from "@/components/dashboard/PropertyForm";
import { EmptyState, Spinner } from "@/components/ui/Feedback";
import { useProperty, useSaveProperty } from "@/hooks/queries";
import { errorMessage } from "@/lib/api";
import { useAuth } from "@/stores/auth";

/** Create (no slug) or edit (/listings/:slug/edit) a property. */
export default function ListingEditor() {
  const { slug } = useParams();
  const base = useDashboardBase();
  const navigate = useNavigate();
  const isAdmin = useAuth((s) => s.user?.role === "admin");
  const { data, isLoading } = useProperty(slug);
  const save = useSaveProperty();

  if (slug && isLoading) return <Spinner />;
  if (slug && !data) return <EmptyState title="Listing not found" />;

  const existing = data?.property;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={existing ? `Edit “${existing.title}”` : isAdmin ? "Post a property" : "Add a listing"}
        subtitle={
          isAdmin
            ? "Admin posts go live immediately."
            : existing
              ? "Saving changes sends the listing back for a quick review."
              : "Your listing will be reviewed by our team before it goes live."
        }
      />
      <PropertyForm
        key={existing?._id ?? "new"}
        initial={existing}
        submitting={save.isPending}
        submitLabel={existing ? "Save changes" : isAdmin ? "Publish property" : "Submit for review"}
        onSubmit={(payload) =>
          save.mutate(
            { id: existing?._id, data: payload },
            {
              onSuccess: () => {
                toast.success(existing ? "Listing updated" : isAdmin ? "Property published" : "Listing submitted for review");
                navigate(`${base}/listings`);
              },
              onError: (err) => toast.error(errorMessage(err)),
            },
          )
        }
      />
    </div>
  );
}
