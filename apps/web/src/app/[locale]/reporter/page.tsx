import { redirect } from "next/navigation";

/** The reporter workspace now lives in the locale-free admin app. */
export default function ReporterPage() {
  redirect("/admin/articles");
}
