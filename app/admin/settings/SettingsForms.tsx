"use client";

import { useState } from "react";
import { saveAdminProfile, saveStoreSettings } from "@/app/actions/settings";

type StoreSettingsData = {
  storeName: string;
  description: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
  deliveryFee: number;
  freeShippingThreshold: number;
};

type AdminProfile = {
  username: string;
  email: string;
};

type SettingsData = {
  store: StoreSettingsData;
  admin: AdminProfile;
};

const inputClass =
  "mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10";
const labelClass = "text-sm font-medium text-slate-700";

export default function SettingsForms({
  initialSettings,
}: {
  initialSettings: SettingsData;
}) {
  const [store, setStore] = useState<StoreSettingsData>(initialSettings.store);
  const [profile, setProfile] = useState<AdminProfile>(initialSettings.admin);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [storeMessage, setStoreMessage] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [savingStore, setSavingStore] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  function updateStore<Key extends keyof StoreSettingsData>(
    key: Key,
    value: StoreSettingsData[Key],
  ) {
    setStore((current) => ({ ...current, [key]: value }));
  }

  async function handleStoreSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingStore(true);
    setStoreMessage("");
    try {
      const result = await saveStoreSettings(store);
      setStoreMessage(result.message);
    } catch (error) {
      console.error("Failed to save store settings:", error);
      setStoreMessage("Could not save store settings. Please try again.");
    } finally {
      setSavingStore(false);
    }
  }

  async function handleProfileSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMessage("");
    try {
      const result = await saveAdminProfile({
        ...profile,
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      setProfileMessage(result.message);
      if (result.success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch (error) {
      console.error("Failed to save admin profile:", error);
      setProfileMessage("Could not save your profile. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-2">
      <form
        onSubmit={handleStoreSave}
        className="space-y-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
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

        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-base font-semibold text-slate-900">Delivery pricing</h3>
          <p className="mt-1 text-sm text-slate-500">
            Amounts are in Indian rupees and update cart and checkout totals.
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Delivery fee (₹)</span>
              <input
                className={inputClass}
                type="number"
                min="0"
                step="1"
                value={store.deliveryFee}
                onChange={(event) => updateStore("deliveryFee", Number(event.target.value))}
                required
              />
            </label>
            <label className="block">
              <span className={labelClass}>Free delivery from (₹)</span>
              <input
                className={inputClass}
                type="number"
                min="0"
                step="1"
                value={store.freeShippingThreshold}
                onChange={(event) => updateStore("freeShippingThreshold", Number(event.target.value))}
                required
              />
            </label>
          </div>
        </div>

        {storeMessage && (
          <p role="status" className="text-sm text-slate-600">{storeMessage}</p>
        )}
        <button
          type="submit"
          disabled={savingStore}
          className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60"
        >
          {savingStore ? "Saving…" : "Save store settings"}
        </button>
      </form>

      <form
        onSubmit={handleProfileSave}
        className="space-y-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Admin account</h2>
          <p className="mt-1 text-sm text-slate-500">
            Update your sign-in details. Password changes sign out your other admin sessions.
          </p>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className={labelClass}>Name</span>
            <input
              className={inputClass}
              maxLength={60}
              value={profile.username}
              onChange={(event) => setProfile({ ...profile, username: event.target.value })}
              required
            />
          </label>
          <label className="block">
            <span className={labelClass}>Email</span>
            <input
              className={inputClass}
              type="email"
              value={profile.email}
              onChange={(event) => setProfile({ ...profile, email: event.target.value })}
              required
            />
          </label>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-base font-semibold text-slate-900">Change password</h3>
          <p className="mt-1 text-sm text-slate-500">Leave these fields empty to keep your current password.</p>
          <div className="mt-5 space-y-5">
            <label className="block">
              <span className={labelClass}>Current password</span>
              <input
                className={inputClass}
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </label>
            <label className="block">
              <span className={labelClass}>New password</span>
              <input
                className={inputClass}
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Confirm new password</span>
              <input
                className={inputClass}
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
              />
            </label>
          </div>
        </div>

        {profileMessage && (
          <p role="status" className="text-sm text-slate-600">{profileMessage}</p>
        )}
        <button
          type="submit"
          disabled={savingProfile}
          className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60"
        >
          {savingProfile ? "Saving…" : "Save admin account"}
        </button>
      </form>
    </div>
  );
}
