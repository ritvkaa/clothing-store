import { redirect } from "next/navigation";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/admin-auth";
import StoreName from "@/app/_components/StoreName";

const statusStyles: Record<string, { text: string; dot: string }> = {
  placed: { text: "text-amber-600", dot: "bg-amber-500" },
  confirmed: { text: "text-amber-600", dot: "bg-amber-500" },
  shipped: { text: "text-blue-600", dot: "bg-blue-500" },
  out_for_delivery: { text: "text-blue-600", dot: "bg-blue-500" },
  delivered: { text: "text-emerald-600", dot: "bg-emerald-500" },
  cancelled: { text: "text-rose-600", dot: "bg-rose-500" },
};

const statusLabels: Record<string, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default async function AdminPage() {
  if (!(await getCurrentAdmin())) redirect("/");

  await connectDB();

  const [totalOrders, totalProducts, totalCustomers, paidOrders, recentOrders] =
    await Promise.all([
      Order.countDocuments({}),
      Product.countDocuments({}),
      User.countDocuments({ role: "user" }),
      Order.aggregate([
        {
          $match: {
            $or: [
              { paymentStatus: "paid", orderStatus: { $ne: "cancelled" } },
              { paymentMethod: "cod", orderStatus: "delivered" },
            ],
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.find({})
        .select("shippingAddress.name orderStatus totalAmount createdAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

  const revenue = paidOrders[0]?.total ?? 0;

  const stats = [
    { label: "Total Orders", value: totalOrders.toLocaleString("en-IN") },
    { label: "Products", value: totalProducts.toLocaleString("en-IN") },
    { label: "Customers", value: totalCustomers.toLocaleString("en-IN") },
    { label: "Revenue", value: formatCurrency(revenue) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Overview of your <StoreName /> store.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              {stat.label}
            </p>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

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
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    No orders yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const status = order.orderStatus || "placed";
                  const statusStyle = statusStyles[status] || {
                    text: "text-slate-600",
                    dot: "bg-slate-400",
                  };
                  const statusLabel =
                    statusLabels[status] || status.replaceAll("_", " ");

                  return (
                    <tr
                      key={order._id.toString()}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        #{order._id.toString().slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {order.shippingAddress?.name || "Customer"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 text-sm font-medium ${statusStyle.text}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                        {formatCurrency(order.totalAmount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
