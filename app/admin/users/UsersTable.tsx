"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

type User = {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
};

export default function UsersTable({
  users,
}: {
  users: User[];
}) {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) =>
      [
        user.username,
        user.email,
        user.phone,
        user.role,
      ]
        .filter(Boolean)
        .some((value) =>
          value!.toLowerCase().includes(query),
        ),
    );
  }, [users, search]);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* TABLE HEADER */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            All Users
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            View registered users and account roles.
          </p>
        </div>

        <div className="relative w-full lg:w-72">
          <Search
            size={16}
            strokeWidth={1.7}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-[10px] font-semibold tracking-[0.15em] text-slate-500">
                USER
              </th>

              <th className="px-6 py-4 text-[10px] font-semibold tracking-[0.15em] text-slate-500">
                PHONE
              </th>

              <th className="px-6 py-4 text-[10px] font-semibold tracking-[0.15em] text-slate-500">
                ROLE
              </th>

              <th className="px-6 py-4 text-[10px] font-semibold tracking-[0.15em] text-slate-500">
                JOINED
              </th>

              <th className="px-6 py-4 text-right text-[10px] font-semibold tracking-[0.15em] text-slate-500">
                ACTION
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user._id}
                className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
              >
                {/* USER */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {user.username
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {user.username}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* PHONE */}
                <td className="px-6 py-5 text-sm text-slate-600">
                  {user.phone || "—"}
                </td>

                {/* ROLE */}
                <td className="px-6 py-5">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.1em] ${
                      user.role === "admin"
                        ? "bg-lime-100 text-lime-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {user.role === "admin" ? "ADMIN" : "CUSTOMER"}
                  </span>
                </td>

                {/* JOINED */}
                <td className="px-6 py-5 text-sm text-slate-500">
                  {new Date(user.createdAt).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                </td>

                {/* ACTION */}
                <td className="px-6 py-5 text-right">
                  <button
                    type="button"
                    className="text-xs font-medium tracking-[0.1em] text-slate-500 transition hover:text-slate-900"
                  >
                    VIEW
                  </button>
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center"
                >
                  <p className="text-sm font-medium text-slate-600">
                    No users found
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Try a different name, email, phone, or role.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
        <p className="text-xs text-slate-400">
          Showing {filteredUsers.length} of {users.length} registered users
        </p>
      </div>
    </section>
  );
}