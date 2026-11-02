
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  createAdmin,
  removeAdmin,
  updateAdmin,
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

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggle,
  placeholder,
  autoComplete,
  required,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  placeholder: string;
  autoComplete: string;
  required: boolean;
  minLength?: number;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-label={label}
          value={value}
          required={required}
          minLength={minLength}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          title={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  );
}

export default function AdminsTable({
  admins,
}: {
  admins: Admin[];
}) {
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const editDialogRef = useRef<HTMLDialogElement>(null);
  const [showEditCurrentPassword, setShowEditCurrentPassword] = useState(false);
  const [showEditNewPassword, setShowEditNewPassword] = useState(false);
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
  });
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
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

  const passwordChangeStarted = Boolean(
    editForm.currentPassword || editForm.newPassword || editForm.confirmNewPassword,
  );

  useEffect(() => {
    const dialog = editDialogRef.current;
    if (!dialog) return;

    if (editingAdmin && !dialog.open) {
      dialog.showModal();
    } else if (!editingAdmin && dialog.open) {
      dialog.close();
    }
  }, [editingAdmin]);

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

  function startEditingAdmin(admin: Admin) {
    setEditingAdmin(admin);
    setShowEditCurrentPassword(false);
    setShowEditNewPassword(false);
    setShowEditConfirmPassword(false);
    setEditForm({
      username: admin.username,
      email: admin.email,
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setShowAddForm(false);
  }

  async function handleEditAdmin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingAdmin) return;

    setLoadingId(`edit-${editingAdmin._id}`);
    try {
      const result = await updateAdmin(editingAdmin._id, editForm);
      if (!result.success) {
        alert(result.message);
        setLoadingId(null);
        return;
      }

      window.location.reload();
    } catch {
      alert("Something went wrong while updating the administrator.");
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
            onClick={() => {
              setEditingAdmin(null);
              setShowAddForm((value) => !value);
            }}
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

      {editingAdmin && (
        <dialog
          ref={editDialogRef}
          aria-labelledby="edit-admin-dialog-title"
          onClose={() => setEditingAdmin(null)}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              editDialogRef.current?.close();
            }
          }}
          className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-0 shadow-2xl backdrop:bg-slate-950/50"
        >
          <form onSubmit={handleEditAdmin} className="p-5 sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3
                  id="edit-admin-dialog-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  Edit Administrator
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Update account details here. Password changes are optional
                  and verified below.
                </p>
              </div>
              <button
                type="button"
                onClick={() => editDialogRef.current?.close()}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Username
                </span>
                <input
                  required
                  type="text"
                  maxLength={60}
                  value={editForm.username}
                  onChange={(event) =>
                    setEditForm({ ...editForm, username: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </span>
                <input
                  required
                  type="email"
                  value={editForm.email}
                  onChange={(event) =>
                    setEditForm({ ...editForm, email: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </label>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-900">
                  Change password{" "}
                  <span className="font-normal text-slate-400">(optional)</span>
                </h4>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Leave these fields blank to keep the current password. To
                  change it, enter your current password and confirm the new
                  one.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <PasswordField
                  label="Your current password"
                  placeholder="Your current password"
                  autoComplete="current-password"
                  value={editForm.currentPassword}
                  onChange={(currentPassword) =>
                    setEditForm({ ...editForm, currentPassword })
                  }
                  visible={showEditCurrentPassword}
                  onToggle={() =>
                    setShowEditCurrentPassword((visible) => !visible)
                  }
                  required={passwordChangeStarted}
                />
                <PasswordField
                  label="New password"
                  placeholder="New password"
                  autoComplete="new-password"
                  value={editForm.newPassword}
                  onChange={(newPassword) =>
                    setEditForm({ ...editForm, newPassword })
                  }
                  visible={showEditNewPassword}
                  onToggle={() => setShowEditNewPassword((visible) => !visible)}
                  required={passwordChangeStarted}
                  minLength={6}
                />
                <PasswordField
                  label="Confirm new password"
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  value={editForm.confirmNewPassword}
                  onChange={(confirmNewPassword) =>
                    setEditForm({ ...editForm, confirmNewPassword })
                  }
                  visible={showEditConfirmPassword}
                  onToggle={() =>
                    setShowEditConfirmPassword((visible) => !visible)
                  }
                  required={passwordChangeStarted}
                  minLength={6}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loadingId === `edit-${editingAdmin._id}`}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {loadingId === `edit-${editingAdmin._id}`
                  ? "Saving..."
                  : "Save Administrator"}
              </button>
            </div>
          </form>
        </dialog>
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
                      <div className="flex justify-end gap-2">
                        <button
                          disabled={loadingId !== null}
                          onClick={() => startEditingAdmin(admin)}
                          className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
                        >
                          Edit
                        </button>
                        {online ? (
                          <span className="self-center text-xs font-medium text-slate-400">
                            Must be offline to remove
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
                      </div>
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
