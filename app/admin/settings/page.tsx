import { redirect } from "next/navigation";
import { getAdminSettings } from "@/app/actions/settings";
import SettingsForms from "./SettingsForms";

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();
  if (!settings) redirect("/");

  return (
    <div className="space-y-8">
      <header className="border-b border-slate-200 pb-6">
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Store details
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage the details customers see on the storefront.
        </p>
      </header>

      <SettingsForms initialStore={settings} />
    </div>
  );
}
