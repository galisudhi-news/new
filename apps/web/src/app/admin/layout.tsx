import { Suspense } from "react";
import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: {
    default: "Newsroom Admin",
    template: "%s | ಗಾಳಿ ಸುದ್ದಿ Admin"
  },
  robots: { index: false, follow: false }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="p-10 text-sm font-semibold text-black/50">Loading workspace…</div>}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
