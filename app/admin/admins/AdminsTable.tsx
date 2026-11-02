
"use client";

import { useMemo, useState } from "react";
import {
  createAdmin,
  removeAdmin,
} from "@/app/actions/profile";

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

export default function AdminsTable({
  admins,
}: {
  admins: Admin[];
}) {
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
  });

  const filteredAdmins = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return admins;

    return admins.filter(
      (admin) =>
        admin.username.toLowerCase().includes(query) ||
        admin.email.toLowerCase().includes(query) ||
        (admin.phone || "").includes(query),
    );
  }, [admins, search]);

  function isOnline(admin: Admin) {
    if (!admin.lastSeenAt) return false;

    return (
      Date.now() - new Date(admin.lastSeenAt).getTime() <=
      2 * 60 * 1000
    );
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();

    setLoadingId("create");

    try {
      const result = await createAdmin(form);

      if (!result.success) {
        alert(result.message);
        setLoadingId(null);
        return;
      }

      setForm({
        username: "",
        email: "",
        password: "",
        phone: "",
      });

      setShowAddForm(false);
      setLoadingId(null);

      window.location.reload();
    } catch {
      alert("Something went wrong while creating the administrator.");
      setLoadingId(null);
    }
  }

  async function handleRemoveAdmin(adminId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this administrator?",
    );

    if (!confirmed) return;

    setLoadingId(adminId);

    try {
      const result = await removeAdmin(adminId);

      if (!result.success) {
        alert(result.message);
        setLoadingId(null);
        return;
      }

      window.location.reload();
    } catch {
      alert("Something went wrong while removing the administrator.");
      setLoadingId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Administrator Accounts
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {filteredAdmins.length} administrator
            {filteredAdmins.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Search admins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-400 sm:w-64"
          />

          <button
            onClick={() => setShowAddForm((value) => !value)}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {showAddForm ? "Cancel" : "+ Add Admin"}
          </button>
        </div>
      </div>

      {/* Add admin form */}
      {showAddForm && (
        <form
          onSubmit={handleAddAdmin}
          className="border-b border-slate-200 bg-slate-50 p-5"
        >
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-slate-900">
              Add Administrator
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Any administrator can create administrator accounts.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              required
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={(e) =>
                setForm({
                  ...form,
                  username: e.target.value,
                })
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
            />

            <input
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
            />

            <input
              required
              type="password"
              placeholder="Password"
              minLength={6}
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
            />

            <input
              type="tel"
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={loadingId === "create"}
            className="mt-4 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {loadingId === "create"
              ? "Creating..."
              : "Create Administrator"}
          </button>
        </form>
      )}

      {/* Table */}
      {filteredAdmins.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-sm font-medium text-slate-900">
            No administrators found
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Administrator
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Role
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Joined
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredAdmins.map((admin) => {
                const online = isOnline(admin);
                const loading = loadingId === admin._id;

                return (
                  <tr
                    key={admin._id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-6 py-5">
                      <div className="font-medium text-slate-900">
                        {admin.username}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {admin.email}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        Administrator
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            online
                              ? "bg-emerald-500"
                              : "bg-slate-300"
                          }`}
                        />

                        <span
                          className={`text-sm font-medium ${
                            online
                              ? "text-emerald-600"
                              : "text-slate-500"
                          }`}
                        >
                          {online ? "Online" : "Offline"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {new Date(admin.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </td>

                    <td className="px-6 py-5 text-right">
                      {online ? (
                        <span className="text-xs font-medium text-slate-400">
                          Must be offline
                        </span>
                      ) : (
                        <button
                          disabled={loading}
                          onClick={() => handleRemoveAdmin(admin._id)}
                          className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          {loading ? "Removing..." : "Remove"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
