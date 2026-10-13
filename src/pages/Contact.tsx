import { useState } from "react";
import { toast } from "sonner";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/layout/PublicLayout";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useSendInquiry } from "@/hooks/queries";
import { errorMessage } from "@/lib/api";
import { CONTACT } from "@/lib/constants";
import { WhatsAppLink } from "@/components/WhatsAppButton";

const empty = { name: "", email: "", phone: "", subject: "", message: "" };

export default function Contact() {
  const [form, setForm] = useState(empty);
  const send = useSendInquiry();
  const bind = (k: keyof typeof empty) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value }),
  });

  return (
    <>
      <PageHero title="Contact Us" subtitle="Questions about a property, or want to list with us? We'd love to hear from you." />
      <section className="container-page grid gap-10 py-20 lg:grid-cols-3">
        <div className="space-y-4">
          {[
            { icon: Phone, label: "Call us", value: CONTACT.phone, href: `tel:${CONTACT.phone}` },
            { icon: Mail, label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
            { icon: MapPin, label: "Office", value: CONTACT.address },
            { icon: Clock, label: "Hours", value: "Mon – Sat, 9am – 6pm" },
          ].map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="flex items-start gap-4 rounded-xl bg-brand-50 p-5">
              <Icon className="mt-0.5 size-5 text-brand-600" />
              <div className="min-w-0">
                <p className="text-sm text-gray-500">{label}</p>
                {href ? (
                  <a href={href} className="break-all font-semibold text-gray-900 hover:text-brand-600">
                    {value}
                  </a>
                ) : (
                  <p className="font-semibold text-gray-900">{value}</p>
                )}
              </div>
            </div>
          ))}
          <WhatsAppLink className="w-full" label="Chat with us on WhatsApp" />
        </div>

        <form
          className="grid gap-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:grid-cols-2 sm:p-8 lg:col-span-2"
          onSubmit={(e) => {
            e.preventDefault();
            send.mutate(
              { ...form, phone: form.phone || undefined, subject: form.subject || undefined },
              {
                onSuccess: (res) => {
                  toast.success(res.message ?? "Message sent");
                  setForm(empty);
                },
                onError: (err) => toast.error(errorMessage(err)),
              },
            );
          }}
        >
          <Field label="Full name">
            <Input required {...bind("name")} />
          </Field>
          <Field label="Email">
            <Input required type="email" {...bind("email")} />
          </Field>
          <Field label="Phone" hint="(optional)">
            <Input {...bind("phone")} />
          </Field>
          <Field label="Subject" hint="(optional)">
            <Input {...bind("subject")} />
          </Field>
          <Field label="Message" className="sm:col-span-2">
            <Textarea required rows={6} {...bind("message")} />
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit" size="lg" loading={send.isPending}>
              Send message
            </Button>
          </div>
        </form>
      </section>
    </>
  );
}
