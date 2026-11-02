
"use client";

import { useEffect, useState } from "react";
import { getCustomers } from "@/app/actions/profile";
import CustomersTable from "./CustomersTable";

type Customer = {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export default function CustomersPageClient() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadCustomers() {
      try {
        const result = await getCustomers();

        if (!cancelled) {
          setCustomers(result);
        }
      } catch {
        if (!cancelled) {
          setCustomers([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCustomers();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-slate-500">
        Loading customers...
      </div>
    );
  }

  const activeCustomers = customers.filter(
    (customer) => customer.isActive,
  ).length;

  const disabledCustomers = customers.length - activeCustomers;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-slate-400">
          ADMIN / CUSTOMERS
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Customers
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage customer accounts and access.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Customers
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {customers.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active
          </p>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">
            {activeCustomers}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Disabled
          </p>
          <p className="mt-2 text-3xl font-semibold text-red-500">
            {disabledCustomers}
          </p>
        </div>
      </div>

      <CustomersTable customers={customers} />
    </div>
  );
}
