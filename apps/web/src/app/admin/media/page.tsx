"use client";

import { PageHeader } from "@/components/admin/ui";

export default function AdminMediaPage() {
  return (
    <div className="min-w-0">
      <PageHeader eyebrow="Workspace" title="Media Library" />
      <div className="mt-6 rounded-lg border bg-white p-6 shadow-editorial">
        <p className="text-sm text-black/60">
          Images are attached to articles by URL in the article editor (Featured image / OG image). Uploads to object
          storage are handled by the media service and are not part of the editorial approval workflow.
        </p>
      </div>
    </div>
  );
}
