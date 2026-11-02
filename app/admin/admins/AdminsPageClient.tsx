
"use client";

import { useEffect, useState } from "react";
import { getAdmins } from "@/app/actions/profile";
import AdminsTable from "./AdminsTable";

type Admin = {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastSeenAt?: string | null;
};

export default function AdminsPageClient() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadAdmins() {
      try {
        const result = await getAdmins();

        if (!cancelled) {
          setAdmins(result);
        }
      } catch {
        if (!cancelled) {
          setAdmins([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAdmins();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-slate-500">
        Loading administrators...
      </div>
    );
  }

  const onlineAdmins = admins.filter((admin) => {
    if (!admin.lastSeenAt) return false;

    return (
      Date.now() - new Date(admin.lastSeenAt).getTime() <=
      2 * 60 * 1000
    );
  }).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-slate-400">
          ADMIN / ADMINS
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Administrators
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage administrator accounts and access.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Admins
          </p>

          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {admins.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Online
          </p>

          <p className="mt-2 text-3xl font-semibold text-emerald-600">
            {onlineAdmins}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Offline
          </p>

          <p className="mt-2 text-3xl font-semibold text-slate-500">
            {admins.length - onlineAdmins}
          </p>
        </div>
      </div>

      <AdminsTable admins={admins} />
    </div>
  );
}
