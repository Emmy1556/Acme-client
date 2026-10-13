import { useState } from "react";
import { Link } from "react-router";
import { Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/layout/DashboardLayout";
import { Badge, EmptyState, Pagination, Spinner } from "@/components/ui/Feedback";
import { Select } from "@/components/ui/Field";
import { useInquiries, useUpdateInquiry } from "@/hooks/queries";
import { timeAgo } from "@/lib/format";
import type { Inquiry } from "@/lib/types";

const TONE = { new: "gold", read: "blue", closed: "gray" } as const;

export default function Inquiries() {
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useInquiries({ status: status || undefined, page });
  const update = useUpdateInquiry();

  return (
    <>
      <PageHeader title="Enquiries" subtitle="Every enquiry from the website — property enquiries and contact-form messages." />
      <Select className="mb-4 w-44" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Status">
        <option value="">All</option>
        <option value="new">New</option>
        <option value="read">Read</option>
        <option value="closed">Closed</option>
      </Select>

      {isLoading ? (
        <Spinner />
      ) : data?.items.length ? (
        <div className="space-y-3">
          {data.items.map((q) => (
            <article key={q._id} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    {q.name} <Badge tone={TONE[q.status]} className="ml-2 align-middle">{q.status}</Badge>
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {timeAgo(q.createdAt)}
                    {q.property && (
                      <>
                        {" · re: "}
                        <Link to={`/properties/${q.property.slug}`} className="text-brand-600 hover:underline">
                          {q.property.title}
                        </Link>
                      </>
                    )}
                    {!q.property && q.subject && ` · ${q.subject}`}
                  </p>
                </div>
                <Select
                  className="h-8 w-32 text-xs"
                  value={q.status}
                  onChange={(e) => update.mutate({ id: q._id, status: e.target.value as Inquiry["status"] })}
                  aria-label="Update status"
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="closed">Closed</option>
                </Select>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-gray-700">{q.message}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <a href={`mailto:${q.email}`} className="flex items-center gap-1.5 text-brand-600 hover:underline">
                  <Mail className="size-4" /> {q.email}
                </a>
                {q.phone && (
                  <a href={`tel:${q.phone}`} className="flex items-center gap-1.5 text-brand-600 hover:underline">
                    <Phone className="size-4" /> {q.phone}
                  </a>
                )}
              </div>
            </article>
          ))}
          <Pagination page={data.pagination.page} pages={data.pagination.pages} onChange={setPage} />
        </div>
      ) : (
        <EmptyState title="No enquiries yet" message="When someone contacts you about a listing, it'll show up here." />
      )}
    </>
  );
}
