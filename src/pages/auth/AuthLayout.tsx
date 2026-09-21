import type { ReactNode } from "react";
import { Logo } from "@/components/layout/Logo";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-brand-600 lg:block">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=70"
          alt=""
          className="absolute inset-0 size-full object-cover opacity-30"
        />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo />
          <blockquote className="max-w-md text-2xl font-semibold leading-snug text-white">
            “Helping you own, grow, and invest better.”
            <footer className="mt-3 text-sm font-normal text-gold-300">— Acme Homes and Properties</footer>
          </blockquote>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo light={false} />
          </div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
