import { getOrders } from "@/app/actions/sales";
import { ShoppingCart, Plus } from "lucide-react";
import Link from "next/link";

export default async function SalesPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Savdolar Tarixi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Barcha savdolar va tushumlar ro'yxati.
          </p>
        </div>
        <Link
          href="/admin/sales/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Yangi Savdo (POS)
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 font-semibold text-sm text-slate-500 uppercase tracking-wider">Sana</th>
                <th className="px-6 py-4 font-semibold text-sm text-slate-500 uppercase tracking-wider">Mijoz</th>
                <th className="px-6 py-4 font-semibold text-sm text-slate-500 uppercase tracking-wider">Tovarlar</th>
                <th className="px-6 py-4 font-semibold text-sm text-slate-500 uppercase tracking-wider text-right">Summa (USD)</th>
                <th className="px-6 py-4 font-semibold text-sm text-slate-500 uppercase tracking-wider text-right">Foyda (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Savdolar topilmadi.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(order.createdAt).toLocaleString("uz-UZ")}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {order.customer.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {order.items.length} xil mahsulot
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
                      ${Number(order.totalAmountUsd).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
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
