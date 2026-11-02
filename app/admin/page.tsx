import StoreName from "@/app/_components/StoreName";

export default function AdminPage() {
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>

        <p className="mt-1.5 text-sm text-slate-500">
          Overview of your <StoreName /> store.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Total Orders
          </p>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            120
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Products
          </p>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            45
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Customers
          </p>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            350
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Revenue
          </p>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            ₹18,540
          </p>
        </div>
      </div>

      {/* RECENT ORDERS */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-base font-semibold text-slate-900">
            Recent Orders
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest activity from your store.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70">
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Order ID
                </th>

                <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Customer
                </th>

                <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Status
                </th>

                <th className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  #1001
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  Ritwika
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Delivered
                  </span>
                </td>

                <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                  ₹80
                </td>
              </tr>

              <tr className="border-b border-slate-100">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  #1002
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  Rahul
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-amber-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Processing
                  </span>
                </td>

                <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                  ₹55
                </td>
              </tr>

              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  #1003
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  Priya
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-blue-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    Shipped
                  </span>
                </td>

                <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                  ₹120
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
