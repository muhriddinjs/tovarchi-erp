import { getCustomers } from "@/app/actions/sales";
import { Plus, Users } from "lucide-react";
import Link from "next/link";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Mijozlar
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Mijozlar ro&apos;yxati, qarzlar va hisob-kitoblarni boshqarish.
          </p>
        </div>
        <Link
          href="/admin/customers/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Yangi mijoz qo&apos;shish
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Mijoz</th>
                <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Telefon</th>
                <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider text-right">Balans (USD)</th>
                <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider text-right">Harakat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    Mijozlar topilmadi. Boshlash uchun yangi mijoz qo&apos;shing.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                          <Users className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{customer.phone || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold ${Number(customer.balanceUsd) < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        ${Number(customer.balanceUsd).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/customers/${customer.id}`}
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Akt Sverka
                      </Link>
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
