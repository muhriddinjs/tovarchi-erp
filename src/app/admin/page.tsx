import { getDashboardStats } from "@/app/actions/sales";
import {
  Package,
  Truck,
  Users,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Warehouse,
  DollarSign,
} from "lucide-react";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const cards = [
    {
      label: "Jami mahsulotlar",
      value: stats.totalProducts,
      icon: Package,
      iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
      iconColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Jami kirimlar",
      value: stats.totalSupplies,
      icon: Truck,
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Jami mijozlar",
      value: stats.totalCustomers,
      icon: Users,
      iconBg: "bg-violet-50 dark:bg-violet-500/10",
      iconColor: "text-violet-600 dark:text-violet-400",
    },
    {
      label: "Jami savdolar",
      value: stats.totalOrders,
      icon: ShoppingCart,
      iconBg: "bg-sky-50 dark:bg-sky-500/10",
      iconColor: "text-sky-600 dark:text-sky-400",
    },
    {
      label: "Jami tushum (USD)",
      value: `$${Number(stats.totalRevenue).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      iconBg: "bg-amber-50 dark:bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Jami foyda (USD)",
      value: `$${Number(stats.totalProfit).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Mijozlar balansi",
      value: `$${Number(stats.totalDebt).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: AlertTriangle,
      iconBg:
        Number(stats.totalDebt) < 0
          ? "bg-rose-50 dark:bg-rose-500/10"
          : "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor:
        Number(stats.totalDebt) < 0
          ? "text-rose-600 dark:text-rose-400"
          : "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Ombordagi qoplar",
      value: stats.remainingSacks,
      icon: Warehouse,
      iconBg: "bg-teal-50 dark:bg-teal-500/10",
      iconColor: "text-teal-600 dark:text-teal-400",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Asosiy panel
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Omborxona, savdolar va moliya haqida umumiy ma&apos;lumot.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`p-3 ${card.iconBg} ${card.iconColor} rounded-xl`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {card.label}
              </p>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                {card.value}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Oxirgi savdolar
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-3 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Sana
                </th>
                <th className="px-6 py-3 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Mijoz
                </th>
                <th className="px-6 py-3 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  Tovarlar
                </th>
                <th className="px-6 py-3 font-semibold text-xs text-slate-500 uppercase tracking-wider text-right">
                  Summa
                </th>
                <th className="px-6 py-3 font-semibold text-xs text-slate-500 uppercase tracking-wider text-right">
                  Foyda
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {stats.recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    Hali savdolar yo&apos;q.
                  </td>
                </tr>
              ) : (
                stats.recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-3 text-sm text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString("uz-UZ")}
                    </td>
                    <td className="px-6 py-3 font-medium text-slate-900 dark:text-white text-sm">
                      {order.customer.name}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {order.items.map((i) => i.product.sku).join(", ")}
                    </td>
                    <td className="px-6 py-3 text-right font-bold text-slate-900 dark:text-white text-sm">
                      ${Number(order.totalAmountUsd).toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      ${Number(order.totalProfitUsd).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
