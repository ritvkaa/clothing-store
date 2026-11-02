import { Search, Users, ShieldCheck, UserRound } from "lucide-react";
import { getAllUsers } from "@/app/actions/profile";
import UsersTable from "./UsersTable";

export default async function UsersPage() {
  const users = await getAllUsers();

  const totalUsers = users.length;

  const adminCount = users.filter(
    (user: { role: string }) => user.role === "admin",
  ).length;

  const customerCount = users.filter(
    (user: { role: string }) => user.role === "user",
  ).length;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-7 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500">
            ADMIN / USERS
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            User Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage customer accounts and administrator access.
          </p>
        </div>

        <div className="text-xs font-medium tracking-[0.12em] text-slate-400">
          {totalUsers} TOTAL USERS
        </div>
      </div>

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-[0.12em] text-slate-500">
              TOTAL USERS
            </p>
            <Users size={18} strokeWidth={1.7} className="text-slate-400" />
          </div>

          <p className="mt-4 text-3xl font-semibold text-slate-900">
            {totalUsers}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Registered accounts
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-[0.12em] text-slate-500">
              CUSTOMERS
            </p>
            <UserRound
              size={18}
              strokeWidth={1.7}
              className="text-slate-400"
            />
          </div>

          <p className="mt-4 text-3xl font-semibold text-slate-900">
            {customerCount}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Regular customer accounts
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-[0.12em] text-slate-500">
              ADMINS
            </p>
            <ShieldCheck
              size={18}
              strokeWidth={1.7}
              className="text-lime-500"
            />
          </div>

          <p className="mt-4 text-3xl font-semibold text-slate-900">
            {adminCount}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Administrator accounts
          </p>
        </div>
      </div>

      <UsersTable users={users} />
    </div>
  );
}
