
"use client";

import { useMemo, useState } from "react";
import {
  deleteCustomer,
  setCustomerStatus,
} from "@/app/actions/profile";

type Customer = {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export default function CustomersTable({
  customers,
}: {
  customers: Customer[];
}) {
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredCustomers = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return customers;

    return customers.filter(
      (customer) =>
        customer.username.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        (customer.phone || "").includes(query),
    );
  }, [customers, search]);

  async function handleStatusChange(
    customerId: string,
    isActive: boolean,
  ) {
    setLoadingId(customerId);

    try {
      const result = await setCustomerStatus(customerId, isActive);

      if (!result.success) {
        alert(result.message);
        setLoadingId(null);
        return;
      }

      window.location.reload();
    } catch {
      alert("Something went wrong. Please try again.");
      setLoadingId(null);
    }
  }

  async function handleDelete(customerId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this customer?",
    );

    if (!confirmed) return;

    setLoadingId(customerId);

    try {
      const result = await deleteCustomer(customerId);

      if (!result.success) {
        alert(result.message);
        setLoadingId(null);
        return;
      }

      window.location.reload();
    } catch {
      alert("Something went wrong. Please try again.");
      setLoadingId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Customer Accounts
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {filteredCustomers.length} customer
            {filteredCustomers.length !== 1 ? "s" : ""}
          </p>
        </div>

        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 sm:w-72"
        />
      </div>

      {/* Table */}
      {filteredCustomers.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-sm font-medium text-slate-900">
            No customers found
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Try changing your search.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Customer
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Contact
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Joined
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((customer) => {
                const isLoading = loadingId === customer._id;

                return (
                  <tr
                    key={customer._id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-6 py-5">
                      <div className="font-medium text-slate-900">
                        {customer.username}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {customer.email}
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {customer.phone || "—"}
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {new Date(customer.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          customer.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {customer.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          disabled={isLoading}
                          onClick={() =>
                            handleStatusChange(
                              customer._id,
                              !customer.isActive,
                            )
                          }
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                          {isLoading
                            ? "Please wait..."
                            : customer.isActive
                              ? "Disable"
                              : "Activate"}
                        </button>

                        <button
                          disabled={isLoading}
                          onClick={() => handleDelete(customer._id)}
                          className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          {isLoading ? "Please wait..." : "Delete"}
                        </button>
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
