import HomepageForm from "@/app/admin/homepage/_components/HomepageForm";
import { getHomepage } from "@/app/actions/homepage";

export default async function HomepageAdminPage() {
  const homepage = await getHomepage();

  return (
    <div className="min-h-full bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Homepage
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage the hero section displayed on the customer homepage.
          </p>
        </div>

        <HomepageForm homepage={homepage} />

      </div>
    </div>
  );
}