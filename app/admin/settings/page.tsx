import { redirect } from "next/navigation";
import { getAdminSettings } from "@/app/actions/settings";
import SettingsForms from "./SettingsForms";

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();
  if (!settings) redirect("/");

  return (
    <div className="space-y-8">
      <header className="border-b border-slate-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Admin / Settings
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Store settings
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Update customer-facing store details, delivery pricing, and your admin account.
        </p>
      </header>

      <SettingsForms initialSettings={settings} />
    </div>
  );
}
