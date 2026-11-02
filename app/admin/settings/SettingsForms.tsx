"use client";

import { useState } from "react";
import { saveStoreSettings } from "@/app/actions/settings";

type StoreDetails = {
  storeName: string;
  description: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
};

const inputClass =
  "mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10";
const labelClass = "text-sm font-medium text-slate-700";

export default function SettingsForms({
  initialStore,
}: {
  initialStore: StoreDetails;
}) {
  const [store, setStore] = useState<StoreDetails>(initialStore);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function updateStore<Key extends keyof StoreDetails>(
    key: Key,
    value: StoreDetails[Key],
  ) {
    setStore((current) => ({ ...current, [key]: value }));
  }

  async function handleStoreSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const result = await saveStoreSettings(store);
      setMessage(result.message);
    } catch (error) {
      console.error("Failed to save store details:", error);
      setMessage("Could not save store details. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleStoreSave}
      className="max-w-3xl space-y-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Store details</h2>
        <p className="mt-1 text-sm text-slate-500">
          These details are shown to customers on the storefront.
        </p>
      </div>

      <div className="space-y-5">
        <label className="block">
          <span className={labelClass}>Store name</span>
          <input
            className={inputClass}
            maxLength={80}
            value={store.storeName}
            onChange={(event) => updateStore("storeName", event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className={labelClass}>Store description</span>
          <textarea
            className={inputClass}
            maxLength={300}
            rows={3}
            value={store.description}
            onChange={(event) => updateStore("description", event.target.value)}
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Support email</span>
            <input
              className={inputClass}
              type="email"
              value={store.supportEmail}
              onChange={(event) => updateStore("supportEmail", event.target.value)}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Support phone</span>
            <input
              className={inputClass}
              type="tel"
              maxLength={30}
              value={store.supportPhone}
              onChange={(event) => updateStore("supportPhone", event.target.value)}
            />
          </label>
        </div>

        <label className="block">
          <span className={labelClass}>Business address</span>
          <textarea
            className={inputClass}
            maxLength={300}
            rows={2}
            value={store.address}
            onChange={(event) => updateStore("address", event.target.value)}
          />
        </label>
      </div>

      {message && (
        <p role="status" className="text-sm text-slate-600">
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save store details"}
      </button>
    </form>
  );
}
